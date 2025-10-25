import { Eval, Exception, FS, log, Process, Query, Store } from "@yao/runtime";
import { Excel } from "excel";
import { Model } from "./model";

/**
 * Import Excel file to table
 * @test yao run scripts.lib.import.ExcelToTable
 * @param file_path
 * @param rule
 */
function ExcelToTable(
  path: string,
  sheet: string,
  rule: Rule,
  from: number = 0,
  chunk_size: number = 500
) {
  const excel = new Excel(path);
  const data = [];
  const origin_data = excel.sheet.Rows(sheet, from, chunk_size);
  excel.Close();

  const fields = [];
  const columns = [];
  rule.columns.map((c) => {
    if (c.name === "__line") {
      return;
    }
    fields.push(c.name);
    columns.push(excel.convert.ColumnNameToNumber(c.name) - 1);
  });

  let line = from;
  origin_data?.forEach((row) => {
    line++;
    if (!row) return;
    const columns_data = columns.map((column) => row[column] || null);
    data.push([line, ...columns_data]);
  });

  // Insert data to table
  const insert = `models.${rule.name}.Insert`;
  Process(insert, ["__line", ...fields], data);
  return data;
}

/**
 * Import Excel file to table
 * @test yao run scripts.lib.import.TableToTable
 * @param source
 * @param target
 * @param cleaner
 * @param from
 * @param chunk_size
 * @returns
 */
function TableToTable(
  source: string,
  target: string,
  report: string,
  cleaner: string | null,
  from: number = 0,
  chunk_size: number = 500
) {
  const target_data = [];
  const error_data = [];
  const res = Process(
    `models.${source}.Paginate`,
    { orders: [{ column: "__line", option: "ASC" }] },
    from,
    chunk_size
  );

  // Clean and fix data
  const source_data = res.data;
  source_data.forEach((row: any) => {
    fmtKey(source, row);
    const target_row = cleaner ? Eval(cleaner, row) : { code: 200, data: row };
    if (target_row && target_row.code && target_row.code !== 200) {
      error_data.push({
        __line: row.__line,
        message: target_row.message || "",
      });
    } else if (target_row && target_row.data) {
      // Add line number to target row
      target_row.data["__line"] = row.__line;
      target_data.push(target_row.data);
    } else {
      throw new Exception(
        "Invalid target row " + JSON.stringify(target_row),
        500
      );
    }
  });

  const effective_data = [];

  // Write Target Data
  target_data.forEach((row: any, index: number) => {
    try {
      Process(`models.${target}.Create`, row);
      effective_data.push(row);
    } catch (err) {
      const message = err.message || "Unknown error" + JSON.stringify(err);
      error_data.push({ __line: row.__line, message });
    }
  });

  // Write error data
  error_data.forEach((row) => {
    try {
      Process(`models.${report}.Upsert`, row, "__line", ["message", "type"]);
    } catch (err) {
      console.error(
        "[Import] Error writing report data error message",
        err,
        row
      );
      log.Error("[Import] Error writing report data error message %v", err);
    }
  });

  const report_data = [];
  error_data.forEach((row) => {
    report_data.push([row.__line, row.message]);
  });

  // Column Structure
  const target_dsl = Model.Get(target, { columns: true });
  const columns_map = {};
  for (const k in target_dsl.columns || {}) {
    const column = target_dsl.columns[k];
    columns_map[column.name] = `${column.label} (${column.name})`;
  }

  // Get column name
  const getColumnName = (c: string) => {
    if (columns_map[c]) {
      return columns_map[c];
    }

    if (c === "__line") {
      return "行号(Excel)";
    }

    if (c === "__id") {
      return "ID(DB)";
    }

    return c;
  };

  const source_columns = [];
  const success_data = [];
  effective_data.forEach((row, index) => {
    if (index == 0) {
      source_columns.push(
        ...Object.keys(row).filter((k) => k !== "__line" && k !== "__id")
      );
    }
    const success_row = [row.__line];
    source_columns.forEach((column) => success_row.push(row[column] || null));
    success_data.push(success_row);
  });

  // Save report data
  effective_data.forEach((row) => {
    try {
      Process(`models.${report}.Create`, {
        __line: row.__line,
        type: "success",
      });
    } catch (err) {
      console.error(
        "[Import] Error writing report data success message",
        err,
        row
      );
    }
  });
  return {
    success: {
      columns: ["行号(Excel)", ...source_columns.map((c) => getColumnName(c))],
      data: success_data,
    },
    error: {
      columns: ["行号(Excel)", "错误信息"],
      data: report_data,
    },
  };
}

/**
 * Excel Key
 * @param name
 * @param row
 */
function fmtKey(name: string, row: Record<string, any>) {
  for (const key in row) {
    if (key?.startsWith(`${name}_`)) {
      const new_key = key.replace(`${name}_`, "").toUpperCase();
      row[new_key] = row[key];
      delete row[key];
    }
  }
}

// Send live message to user
// yao run scripts.lib.import.PreviewMessage
function PreviewMessage(params: ActionParams) {
  const { tables, active, title, update } = params;
  const heads = {};
  tables.forEach((table) => (heads[table.name] = table.data));
  const id = makePreviewData(heads);

  // Update the preview data
  if (update) {
    const props = {
      action: [
        {
          name: "Trigger Update Preview Table",
          type: "Common.emitEvent",
          payload: {
            key: "web/sendMessage",
            value: { type: "update", message: { id, title, active, once: 1 } },
          },
        },
      ],
    };
    return { type: "action", props };
  }

  // Open the preview sidebar for the first time
  const preview = `/web/preview/table?id=${id}&active=${active}&title=${title}&once=1&theme=__theme`;
  const props = {
    action: [
      {
        name: "OpenSidebar",
        type: "Common.emitEvent",
        payload: {
          key: "app/openSidebar",
          value: { title: title, url: preview },
        },
      },
    ],
    namespace: "data-import",
    primary: "id",
  };
  return { type: "action", props };
}

// Make preview data for display
function makePreviewData(heads: Record<string, string[][]>): string {
  const previewData: TableData[] = [];
  for (const name in heads) {
    const data = heads[name];
    previewData.push({ name, data: [...data] });
  }
  const sorted = [...previewData].sort((a, b) => a.name.localeCompare(b.name));
  const uid = Process("crypto.Hash", "MD5", JSON.stringify(sorted));
  const id = `table_${uid}`;
  const fs = new FS("data");
  const path = `/tables/temp/${id}.json`;
  fs.WriteFile(path, JSON.stringify(previewData));
  return id;
}

/**
 * Count rows of model
 * @test yao run scripts.lib.import.CountModel tmp_3691086434_source_店员销售汇总数据
 * @param model
 */
function CountModel(model: string) {
  const qb = new Query("default");
  const rows = qb.Get({
    sql: { stmt: `SELECT COUNT(*) as count FROM \`${model}\`` },
  });

  if (rows.length === 0) {
    return 0;
  }
  return rows[0].count || 0;
}

/**
 * Count rows of model with where condition
 * @test yao run scripts.lib.import.CountModelWhere tmp_202505211935_1984398737_report_store '::{"type": "error"}'
 * @param model
 * @param wheres
 */
function CountModelWhere(model: string, wheres: Record<string, any>) {
  const qb = new Query("default");
  const wheres_str = Object.keys(wheres)
    .map((k) => `${k} = ?`)
    .join(" AND ");

  const args = Object.values(wheres);
  const rows = qb.Get({
    sql: {
      stmt: `SELECT COUNT(*) as count FROM \`${model}\` WHERE ${wheres_str}`,
      args,
    },
  });
  return rows[0].count || 0;
}

/**
 * Count rows of excel file
 * @param file_path
 * @returns
 */
function CountRows(file_path: string, sheet: string) {
  const excel = new Excel(file_path);
  const dim = excel.sheet.Dimension(sheet);
  return dim.rows || 0;
}

/**
 * Get ID With specified field and value
 * @test yao run scripts.lib.import.GetID admin.user email demo@deepexcel.cn
 * @test yao run scripts.lib.import.GetID admin.user '::["email", "status"]' '::{"email": "demo@deepexcel.cn", "status": "enabled"}'
 * @param model
 * @param field
 * @param value
 */
export function GetID(
  model: string,
  field: string | string[],
  value: Record<string, string> | string
) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof field === "string" && typeof value === "string") {
    return getIDString(model, field, value);
  } else if (Array.isArray(field) && typeof value === "object") {
    return getIDArray(model, field, value);
  }

  throw new Exception(
    `Invalid field or value type field:${typeof field} value:${typeof value}`,
    500
  );
}

function getIDString(model: string, field: string, value: string) {
  const cache_key = `getid_${model}_${field}_${value}`;
  const cache = new Store("agent");
  const cached = cache.Get(cache_key);
  if (cached) {
    return cached;
  }

  const rows = Process(`models.${model}.Get`, {
    select: ["id", field],
    wheres: [{ column: field, value: value }],
    limit: 1,
  });

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const result = row.id || null;
  if (result) {
    cache.Set(cache_key, result);
  }
  return result;
}

function getIDArray(
  model: string,
  field: string[],
  values: Record<string, string>
) {
  const field_key = field.join(",");
  const value_key = Process("crypto.hash", "MD5", JSON.stringify(values));
  const cache_key = `getid_${model}_${field_key}_${value_key}`;
  const cache = new Store("agent");
  const cached = cache.Get(cache_key);
  if (cached) {
    return cached;
  }

  const wheres = field.map((f) => ({ column: f, value: values[f] || null }));
  const rows = Process(`models.${model}.Get`, {
    select: ["id", field],
    wheres,
    limit: 1,
  });

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const result = row.id || null;
  if (result) {
    cache.Set(cache_key, result);
  }
  return result;
}

export declare type Rule = {
  name: string; // table name
  columns: Column[]; // columns
};

export declare type Column = {
  name: string; // Excel column name
  label: string; // Excel field name
  type: string;
  length?: number;
  nullable: boolean;
  comment?: string;
};

export declare interface TableData {
  name: string;
  data: string[][];
}

export declare interface ActionParams {
  tables: TableData[];
  active: string;
  title: string;
  update?: boolean;
}
