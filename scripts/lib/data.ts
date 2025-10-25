import { Excel } from "./excel";
import { FS, Process } from "@yao/runtime";

// Define interfaces for the data structure
interface FieldMap {
  deduplication: boolean;
  excel_column: string;
  model_field: string;

  sheet: string;
  transformations: string;
}

interface Config {
  field_maps: { [key: string]: FieldMap[] };
  model: string;
  priority: number;
  sheets: string[];
  mapping_logic?: string;
  requirements?: string;
}

const testData: Config[] = [
  {
    field_maps: {
      店员销售汇总数据: [
        {
          deduplication: true,
          excel_column: "门店",
          model_field: "code",
          sheet: "店员销售汇总数据",
          transformations: "提取纯门店编码（如A18→A18）",
        },
        {
          deduplication: false,
          excel_column: "门店销量占比",
          model_field: "status",
          sheet: "店员销售汇总数据",
          transformations: "转换为门店运营状态评估",
        },
      ],
      "店员销售（原始数据）": [
        {
          deduplication: true,
          excel_column: "门店",
          model_field: "code",
          sheet: "店员销售（原始数据）",
          transformations: "编码标准化",
        },
      ],
    },
    mapping_logic: "通过门店编码建立基础档案，合并汇总表和原始数据中的门店信息",
    model: "store",
    priority: 1,
    requirements: "需处理合并单元格，提取有效门店编码",
    sheets: ["店员销售汇总数据", "店员销售（原始数据）"],
  },
  {
    field_maps: {
      店员销售汇总数据: [
        {
          deduplication: true,
          excel_column: "店员",
          model_field: "name",
          sheet: "店员销售汇总数据",
          transformations: "姓名标准化",
        },
        {
          deduplication: false,
          excel_column: "门店",
          model_field: "store_id",
          sheet: "店员销售汇总数据",
          transformations: "关联store模型编码",
        },
      ],
      "店员销售（原始数据）": [
        {
          deduplication: true,
          excel_column: "店员",
          model_field: "name",
          sheet: "店员销售（原始数据）",
          transformations: "去除非汉字字符",
        },
      ],
    },
    mapping_logic: "基于店员姓名+门店编码建立唯一标识",
    model: "staff",
    priority: 1,
    requirements: "需关联store模型完成后再处理",
    sheets: ["店员销售汇总数据", "店员销售（原始数据）"],
  },
  {
    field_maps: {
      客户往年销售情况: [
        {
          deduplication: true,
          excel_column: "名称",
          model_field: "name",
          sheet: "客户往年销售情况",
          transformations: "去除地域前缀（如'E杭州向日葵'→'杭州向日葵'）",
        },
      ],
      "店员销售（原始数据）": [
        {
          deduplication: true,
          excel_column: "客户",
          model_field: "name",
          sheet: "店员销售（原始数据）",
          transformations: "提取客户主体名称",
        },
      ],
    },
    mapping_logic: "合并不同来源的客户名称，建立统一客户档案",
    model: "customer",
    priority: 1,
    requirements: "需处理客户名称的缩写和全称对应",
    sheets: ["客户往年销售情况", "店员销售（原始数据）"],
  },
  {
    field_maps: {
      全款销售情况: [
        {
          deduplication: true,
          excel_column: "商品编码",
          model_field: "code",
          sheet: "全款销售情况",
          transformations: "编码有效性校验",
        },
      ],
      "设计师+品类汇总表": [
        {
          deduplication: false,
          excel_column: "类别",
          model_field: "category_id",
          sheet: "设计师+品类汇总表",
          transformations: "关联category模型",
        },
      ],
    },
    mapping_logic: "通过商品编码建立核心商品档案，关联品类数据",
    model: "product",
    priority: 1,
    requirements: "需先处理category模型",
    sheets: ["全款销售情况", "设计师+品类汇总表"],
  },
  {
    field_maps: {
      主推款销售情况: [
        {
          deduplication: false,
          excel_column: "主推款编码",
          model_field: "style_code",
          sheet: "主推款销售情况",
          transformations: "编码补全（X前缀处理）",
        },
      ],
      "店员销售（原始数据）": [
        {
          deduplication: false,
          excel_column: "款号",
          model_field: "style_code",
          sheet: "店员销售（原始数据）",
          transformations: "去除特殊符号",
        },
        {
          deduplication: false,
          excel_column: "订货数",
          model_field: "quantity",
          sheet: "店员销售（原始数据）",
          transformations: "数值标准化",
        },
      ],
    },
    mapping_logic: "合并销售记录，建立完整订单流水",
    model: "order",
    priority: 2,
    requirements: "需关联product/staff/customer模型完成后再处理",
    sheets: ["店员销售（原始数据）", "主推款销售情况"],
  },
  {
    field_maps: {
      生产表: [
        {
          deduplication: false,
          excel_column: "颜色",
          model_field: "color",
          sheet: "生产表",
          transformations: "标准化色值",
        },
        {
          deduplication: false,
          excel_column: "码数",
          model_field: "size",
          sheet: "生产表",
          transformations: "尺码标准化（XS/S/M等）",
        },
      ],
    },
    mapping_logic: "通过生产记录建立SKU库存数据",
    model: "sku",
    priority: 2,
    requirements: "需关联product模型",
    sheets: ["生产表"],
  },
  {
    field_maps: {
      "设计师销售（原始数据）": [
        {
          deduplication: true,
          excel_column: "设计师",
          model_field: "name",
          sheet: "设计师销售（原始数据）",
          transformations: "姓名去重",
        },
      ],
    },
    mapping_logic: "直接映射设计师姓名",
    model: "designer",
    priority: 1,
    requirements: "需处理同名设计师合并问题",
    sheets: ["设计师销售（原始数据）"],
  },
  {
    field_maps: {
      "设计师+品类汇总表": [
        {
          deduplication: true,
          excel_column: "类别",
          model_field: "name",
          sheet: "设计师+品类汇总表",
          transformations: "建立三级分类体系",
        },
      ],
    },
    mapping_logic: "通过品类名称建立分类树",
    model: "category",
    priority: 1,
    requirements: "需处理层级关系（如衬衫/中长裙等）",
    sheets: ["设计师+品类汇总表"],
  },
  {
    field_maps: {
      全款销售情况: [
        {
          deduplication: true,
          excel_column: "款号",
          model_field: "code",
          sheet: "全款销售情况",
          transformations: "提取基础款号（如X2070）",
        },
      ],
    },
    mapping_logic: "通过款号建立款式基础档案",
    model: "style",
    priority: 2,
    requirements: "需去除非标准款号记录",
    sheets: ["全款销售情况"],
  },
];

const testFile = "/__assistants/neo/20250322/074e6820.xlsx";

/**
 * Import Excel data into data models
 *
 * @test yao run scripts.lib.data.ImportExcel
 * @param file - The path to the Excel file
 * @param sheet - The sheet name to import
 * @param import_rules - The import rules
 */
export function ImportExcel(
  file: string,
  sheet: string,
  clean_rules: CleanRule[],
  import_rules: ImportRule[]
): void {
  console.log("--- Import Excel Clean ---");
  console.log("sheet:", sheet);
  console.log("clean_rules:", clean_rules);
  console.log("import_rules:", import_rules);
  console.log("--- End Import Excel Clean ---");
  try {
    // 数据清洗
    const cleaned = clean(file, sheet, clean_rules);

    // 如果import_rules不是数组，则将其转换为数组
    if (!Array.isArray(import_rules)) {
      import_rules = [import_rules];
    }

    // 处理导入
    processImport(cleaned.file, cleaned.sheet, import_rules);
  } catch (e) {
    console.log("--- Some Error ---");
    console.log(e.message || e || "Unknown Error");
    console.log("--- End Error ---");
  }
}

const testRules1: CleanRule[] = [
  {
    columnCode: "A",
    startRow: 2,
    flow: [
      { type: "transformation", transformation: "trim" },
      { type: "deduplication" },
    ],
  },
];

const testRules2: CleanRule[] = [
  {
    columnCode: "C",
    startRow: 2,
    flow: [
      { type: "transformation", transformation: "trim" },
      { type: "deduplication" },
    ],
  },
];

const testImportRules: ImportRule[] = [
  {
    mapping: [
      {
        columnCode: "A",
        modelField: "store_id",
        flow: [
          {
            transformations: "getid",
            transformationArgs: ["store", "name"],
          },
        ],
      },
      {
        columnCode: "C",
        modelField: "name",
      },
      {
        columnCode: "E",
        modelField: "customer_name",
        flow: [
          {
            transformations: "extract",
            transformationArgs: ["[A-Z]+(.*)"],
          },
        ],
      },
      {
        columnCode: "E",
        modelField: "customer_id",
        flow: [
          {
            transformations: "extract",
            transformationArgs: ["[A-Z]+(.*)"],
          },
          {
            transformations: "getid",
            transformationArgs: ["customer", "name"],
          },
        ],
      },
    ],
    model: "staff",
    startRow: 2,
  },
];

/**
 * 处理导入
 * @param file 文件路径
 * @param sheet 表名
 * @param rules 导入规则
 * @param chunkSize 每批导入的行数
 * @returns 处理结果
 */
function processImport(
  file: string,
  sheet: string,
  rules: ImportRule[],
  chunkSize: number = 200
): void {
  console.log(`开始导入数据: ${file}, 表: ${sheet}`);

  // 打开Excel文件
  const excel = new Excel(file);

  // 读取所有数据
  console.log(`读取数据...`);
  const rowHandle = excel.each.OpenRow(sheet);
  const allRows: string[][] = [];
  let row: string[] | null;

  while ((row = excel.each.NextRow(rowHandle))) {
    allRows.push([...row]);
  }
  excel.each.CloseRow(rowHandle);
  console.log(`共读取 ${allRows.length} 行数据`);

  // 处理每个导入规则
  for (const rule of rules) {
    console.log(`处理模型 ${rule.model} 的导入...`);

    // 提取标题行索引映射
    const headerRow = allRows[rule.startRow - 2] || [];
    const headerMap: Record<string, number> = {};

    for (let i = 0; i < headerRow.length; i++) {
      headerMap[headerRow[i]] = i;
    }

    // 分批处理数据
    const dataRows = allRows.slice(rule.startRow - 1);
    const batchCount = Math.ceil(dataRows.length / chunkSize);
    console.log(`共 ${dataRows.length} 行数据, 分 ${batchCount} 批处理`);

    // 用于存储提取的值以便进行批量转换
    const extractedValues: Record<string, Record<string, boolean>> = {};
    for (const mapping of rule.mapping) {
      extractedValues[mapping.columnCode] = {};
    }

    // 用于存储转换后的数据
    const transformedData: Record<string, any>[] = [];

    // 第一轮: 提取所有需要的值
    console.log(`第一轮: 提取值...`);
    for (let i = 0; i < dataRows.length; i++) {
      const dataRow = dataRows[i];
      const extractedRow: Record<string, string> = {};

      for (const mapping of rule.mapping) {
        const columnCode = mapping.columnCode;
        const columnIndex = excel.convert.ColumnNameToNumber(columnCode) - 1;

        if (dataRow[columnIndex] === undefined || dataRow[columnIndex] === null)
          continue;

        let value = dataRow[columnIndex].toString();

        // 提取操作
        if (mapping.flow) {
          for (const node of mapping.flow) {
            if (node.transformations === "extract" && node.transformationArgs) {
              const regex = new RegExp(node.transformationArgs[0]);
              value = extract(value, regex);

              if (i === 0) {
                // 只记录第一行的处理过程，避免日志过多
                console.log(
                  `行${i + 1} 字段${mapping.modelField} 提取: "${
                    dataRow[columnIndex]
                  }" -> "${value}" (正则: ${node.transformationArgs[0]})`
                );
              }
              break; // 找到提取规则后退出循环
            }
          }
        }

        // 记录提取后的值，用于后续的getid转换
        if (value) {
          extractedValues[columnCode][value] = true;
          extractedRow[columnCode] = value;
        }
      }
    }

    // 批量转换提取的值
    console.log(`批量转换值...`);
    const transformedValues: Record<string, Record<string, any>> = {};

    for (const mapping of rule.mapping) {
      const columnCode = mapping.columnCode;
      transformedValues[columnCode] = {};

      // 检查该字段是否有需要批量处理的转换
      let needsBatchProcessing = false;

      if (mapping.flow) {
        for (const node of mapping.flow) {
          if (node.transformations === "getid" && node.transformationArgs) {
            needsBatchProcessing = true;
            break;
          }
        }
      }

      if (needsBatchProcessing) {
        const values = Object.keys(extractedValues[columnCode]);
        console.log(
          `字段${
            mapping.modelField
          } (列${columnCode}) 提取的唯一值: ${values.join(", ")}`
        );

        if (mapping.flow) {
          for (const node of mapping.flow) {
            if (
              node.transformations === "getid" &&
              node.transformationArgs &&
              node.transformationArgs.length >= 2
            ) {
              const model = node.transformationArgs[0];
              const field = node.transformationArgs[1];

              if (values.length > 0) {
                console.log(
                  `从模型 ${model} 获取 ${field} 对应的ID, 值: ${values.join(
                    ", "
                  )}`
                );
                const idMap = getid(values, field, model);
                console.log(`获取到的ID映射:`, idMap);

                // 保存转换结果
                for (const [key, id] of Object.entries(idMap)) {
                  transformedValues[columnCode][key] = id;
                }
              }
            }
          }
        }
      }
    }

    // 第二轮: 处理并导入数据
    console.log(`第二轮: 处理并导入数据...`);
    for (let b = 0; b < batchCount; b++) {
      const start = b * chunkSize;
      const end = Math.min(start + chunkSize, dataRows.length);
      const batchRows = dataRows.slice(start, end);
      const records: Record<string, any>[] = [];

      for (let i = 0; i < batchRows.length; i++) {
        const dataRow = batchRows[i];
        const record: Record<string, any> = {};

        // 先进行字段级处理
        const processedValues: Record<string, string> = {};

        // 处理每一列的提取转换
        for (const mapping of rule.mapping) {
          const columnCode = mapping.columnCode;
          const columnIndex = excel.convert.ColumnNameToNumber(columnCode) - 1;

          if (
            dataRow[columnIndex] === undefined ||
            dataRow[columnIndex] === null
          ) {
            processedValues[columnCode] = "";
            continue;
          }

          let value = dataRow[columnIndex].toString();

          // 应用extract转换
          if (mapping.flow) {
            for (const node of mapping.flow) {
              if (
                node.transformations === "extract" &&
                node.transformationArgs
              ) {
                const regex = new RegExp(node.transformationArgs[0]);
                const originalValue = value;
                value = extract(value, regex);

                if (b === 0 && i === 0) {
                  // 只记录第一批次第一行，避免日志过多
                  console.log(
                    `批次${b + 1} 行${i + 1} 字段${
                      mapping.modelField
                    } 提取: "${originalValue}" -> "${value}" (正则: ${
                      node.transformationArgs[0]
                    })`
                  );
                }
                break; // 只应用第一个extract转换
              }
            }
          }

          // 存储处理后的值
          processedValues[columnCode] = value;
        }

        // 然后应用getid转换（可能依赖于上一步提取的值）
        for (const mapping of rule.mapping) {
          const columnCode = mapping.columnCode;
          const fieldName = mapping.modelField;
          let value = processedValues[columnCode] || "";

          // 应用getid转换
          if (mapping.flow) {
            for (const node of mapping.flow) {
              if (node.transformations === "getid" && node.transformationArgs) {
                const originalValue = value;

                // 使用预先计算好的转换映射
                if (
                  transformedValues[columnCode] &&
                  transformedValues[columnCode][value]
                ) {
                  value = transformedValues[columnCode][value];
                } else {
                  value = null;
                }

                if (b === 0 && i === 0) {
                  // 只记录第一批次第一行，避免日志过多
                  console.log(
                    `批次${b + 1} 行${
                      i + 1
                    } 字段${fieldName} 获取ID: "${originalValue}" -> "${value}" (模型: ${
                      node.transformationArgs[0]
                    }, 字段: ${node.transformationArgs[1]})`
                  );
                }
              }
            }
          }

          // 设置字段值
          record[fieldName] = value;
        }

        // 添加到批次
        records.push(record);
      }

      // 导入批次数据
      if (records.length > 0) {
        console.log(
          `批次 ${b + 1}/${batchCount}: 导入 ${records.length} 条记录到模型 ${
            rule.model
          }`
        );
        try {
          const errors = importRows(rule.model, records);

          if (errors.length > 0) {
            console.log(`导入错误:`, errors);
          }
        } catch (error) {
          console.log(`导入错误:`, error);
        }
      }
    }
  }

  excel.Close();
  console.log(`数据导入完成!`);
}

/**
 * 导入行
 * @param model 模型
 * @param rows 行
 * @returns 错误信息
 */
function importRows(model: string, rows: Record<string, any>[]): ImportError[] {
  const errors: ImportError[] = [];
  console.log("--------------------------------");
  console.log("Import Rows", model, rows);
  console.log("--------------------------------");

  try {
    // 使用 EachSave 批量保存记录，忽略错误
    const result = Process(`models.${model}.EachSave`, rows);

    // EachSave 是忽略错误保存的，但检查返回结果
    // 如果返回的ID数量少于输入记录数，说明有记录未能成功保存
    if (Array.isArray(result)) {
      const savedCount = result.length;
      const rejectedCount = rows.length - savedCount;

      if (rejectedCount > 0) {
        console.log(
          `警告: 模型 ${model} 导入, ${savedCount}/${rows.length} 条记录成功, ${rejectedCount} 条被拒绝`
        );
        errors.push({
          rowCode: "统计",
          message: `${rejectedCount} 条记录因验证错误被拒绝`,
        });
      } else {
        console.log(`成功: 模型 ${model} 导入, 全部 ${rows.length} 条记录成功`);
      }
    } else {
      console.log(`模型 ${model} 导入完成, 但返回格式异常`);
    }
  } catch (e) {
    // 捕获整体执行异常
    const error: ImportError = {
      rowCode: "批量",
      message: e instanceof Error ? e.message : String(e),
    };
    errors.push(error);
    console.log(`批量导入异常 [${model}]: ${error.message}`);
  }

  return errors;
}

type ImportError = {
  /**
   * 行号
   */
  rowCode: string;

  /**
   * 错误信息
   */
  message: string;
};

/**
 * 测试数据清洗
 * @test yao run scripts.lib.data.testClean
 */
function testClean() {
  const rules: CleanRule[] = [
    {
      columnCode: "B",
      flow: [
        {
          transformation: "trim",
          type: "transformation",
        },
        {
          type: "deduplication",
        },
      ],
      startRow: 3,
    },
  ];
  clean(testFile, "TOP50走势图", rules);
}

/**
 * 数据清洗
 * @test yao run scripts.lib.data.clean
 * @param file 文件路径
 * @param sheet 表名
 * @param rules 清洗规则
 * @returns 清洗结果
 */
export function clean(
  file: string,
  sheet: string,
  rules: CleanRule[]
): CleanResponse {
  console.log(`开始处理数据: ${file}, 表: ${sheet}`);

  // 打开源文件
  const excel = new Excel(file);

  // 创建输出文件
  const timestamp = new Date().getTime();
  const outputFile = file.replace(".xlsx", `_cleaned_${timestamp}.xlsx`);
  const outputExcel = new Excel(outputFile, true);
  console.log(`输出文件: ${outputFile}`);

  // 设置输出表名
  const outputSheet = "Sheet1";

  // 读取所有数据
  console.log(`读取所有数据...`);
  const rowHandle = excel.each.OpenRow(sheet);
  const allRows: string[][] = [];
  let row: string[] | null;

  while ((row = excel.each.NextRow(rowHandle))) {
    allRows.push([...row]);
  }
  excel.each.CloseRow(rowHandle);
  console.log(`共读取 ${allRows.length} 行数据`);

  // 应用所有转换
  console.log(`应用数据转换...`);
  for (const rule of rules) {
    const columnIdx = excel.convert.ColumnNameToNumber(rule.columnCode) - 1;

    // 应用转换
    for (let i = 0; i < allRows.length; i++) {
      // 跳过标题行
      if (i < rule.startRow - 1) continue;

      let value = allRows[i][columnIdx] || "";

      // 应用转换规则
      for (const node of rule.flow) {
        if (node.type === "transformation") {
          value = applyTransformation(value, node);
        }
      }

      // 更新值
      allRows[i][columnIdx] = value;
    }
  }

  // 处理去重
  console.log(`去除重复数据...`);
  const uniqueRows: string[][] = [];

  const seenValues: Record<string, Record<string, boolean>> = {};

  // 初始化去重跟踪
  for (const rule of rules) {
    if (rule.flow?.some?.((node) => node.type === "deduplication")) {
      seenValues[rule.columnCode] = {};
    }
  }

  // 保留第一行 (标题行)
  if (allRows.length > 0) {
    uniqueRows.push(allRows[0]);
  }

  // 检查剩余行是否有重复
  for (let i = 1; i < allRows.length; i++) {
    let isDuplicate = false;

    // 检查每个需要去重的列
    for (const rule of rules) {
      if (!rule.flow.some((node) => node.type === "deduplication")) continue;

      // 跳过标题行
      if (i < rule.startRow - 1) continue;

      const columnIdx = excel.convert.ColumnNameToNumber(rule.columnCode) - 1;
      const value = allRows[i][columnIdx] || "";

      if (value && seenValues[rule.columnCode][value] === true) {
        isDuplicate = true;
        break;
      }

      if (value) {
        seenValues[rule.columnCode][value] = true;
      }
    }

    // 如果不是重复行，则添加到结果中
    if (!isDuplicate) {
      uniqueRows.push(allRows[i]);
    }
  }

  console.log(`去重后剩余 ${uniqueRows.length} 行数据`);

  // 写入输出文件
  console.log(`写入结果到输出文件...`);
  outputExcel.write.All(outputSheet, "A1", uniqueRows);

  // 保存并关闭文件
  outputExcel.Save();
  outputExcel.Close();
  excel.Close();

  // 打印去重结果
  console.log(`\n去重结果:`);
  for (const rule of rules) {
    if (rule.flow.some((node) => node.type === "deduplication")) {
      const uniqueCount = Object.keys(seenValues[rule.columnCode]).length;
      console.log(`列 ${rule.columnCode}: ${uniqueCount} 个唯一值`);

      // 如果唯一值不多，打印出来供验证
      if (uniqueCount < 20) {
        console.log(
          `列 ${rule.columnCode} 的唯一值:`,
          Object.keys(seenValues[rule.columnCode]).join(", ")
        );
      }
    }
  }

  console.log(
    `\n处理完成: 输入 ${allRows.length} 行, 输出 ${uniqueRows.length} 行`
  );
  console.log(`清洗后的数据已保存到: ${outputFile}`);

  // 获取列信息
  const resultExcel = new Excel(outputFile);
  const resultRowHandle = resultExcel.each.OpenRow(outputSheet);
  const headerRow = resultExcel.each.NextRow(resultRowHandle);
  resultExcel.each.CloseRow(resultRowHandle);

  // 确定列信息
  const columns = headerRow
    ? headerRow.map((name, index) => {
        const code = resultExcel.convert.ColumnNumberToName(index + 1);

        // 尝试判断列类型
        let type: "string" | "number" | "date" = "string";

        // 如果有数据，尝试检查第一个非空值的类型
        if (uniqueRows.length > 1) {
          for (let i = 1; i < uniqueRows.length; i++) {
            const value = uniqueRows[i][index];
            if (value) {
              // 检查是否是数字
              if (!isNaN(Number(value)) && value.trim() !== "") {
                type = "number";
              }
              // 这里可以添加更多的类型判断逻辑，如日期判断
              break;
            }
          }
        }

        return {
          code,
          name: name || code,
          type,
        };
      })
    : [];

  resultExcel.Close();

  // 构建并返回结果
  return {
    file: outputFile,
    sheet: outputSheet,
    columns,
    startRow: 2, // 假设数据从第2行开始，标题在第1行
  };
}

/**
 * 提取字符串
 * @param value 值
 * @param regex 正则表达式
 * @returns 结果
 */
function extract(value: string, regex: RegExp): string {
  const matches = value.match(regex);
  if (!matches) return "";

  // 如果有捕获组，返回第一个捕获组
  if (matches.length > 1) {
    return matches[1].trim();
  }

  // 否则返回整个匹配
  return matches[0].trim();
}

/**
 * 获取ID
 * @param values 值
 * @param field 字段
 * @param model 模型
 * @returns 结果
 */
function getid(
  values: string[],
  field: string,
  model: string
): Record<string, any> {
  console.log("--------------------------------");
  console.log("Get id", values, field, model);
  console.log("--------------------------------");

  const res = Process(`models.${model}.Get`, {
    select: ["id", field],
    where: [{ column: field, op: "in", values: values }],
  });

  const result: Record<string, any> = {};
  for (const item of res) {
    result[item[field]] = item.id;
  }
  return result;
}

/**
 * Apply a single transformation to a value
 */
function applyTransformation(value: string, node: CleanRuleNode): string {
  if (!node.transformation) return value;

  switch (node.transformation) {
    case "trim":
      return value.trim();
    case "regex":
      if (node.transformationArgs && node.transformationArgs.length >= 2) {
        const regex = new RegExp(
          node.transformationArgs[0],
          node.transformationArgs[1] || ""
        );
        const replacement = node.transformationArgs[2] || "";
        return value.replace(regex, replacement);
      }
      return value;
    default:
      return value;
  }
}

type ImportRule = {
  mapping: {
    /**
     * 列名 A, B, C ... AA, AB, AC ...
     */
    columnCode: string;

    /**
     * 模型字段
     */
    modelField: string;

    /**
     * 清洗流程
     */
    flow?: ImportRuleNode[];
  }[];

  /**
   * 数据开始行
   */
  startRow: number;

  /**
   * 导入模型
   */
  model: string;
};

type ImportRuleNode = {
  /**
   * 转换规则
   */
  transformations?: "getid" | "extract";

  /**
   * 转换参数
   */
  transformationArgs?: string[];
};

/**
 * 清洗结果
 */
type CleanResponse = {
  /**
   * 文件名
   */
  file: string;

  /**
   * 表名
   */
  sheet: string; // always "Sheet1" currently

  /**
   * 列
   */
  columns: {
    /**
     * 列名 A, B, C ... AA, AB, AC ...
     */
    code: string;
    /**
     * 列名
     */
    name: string;
    /**
     * 列类型
     */
    type: "string" | "number" | "date";
  }[];

  /**
   * 开始行
   */
  startRow: number;
};

/**
 * 清洗规则
 */
type CleanRule = {
  /**
   * 列名 A, B, C ... AA, AB, AC ...
   */
  columnCode: string;

  /**
   * 数据开始行
   */
  startRow: number;

  /**
   * 清洗流程
   */
  flow: CleanRuleNode[];
};

/**
 * 清洗规则节点
 */
type CleanRuleNode = {
  /**
   * 清洗方式
   */
  type: "deduplication" | "transformation";

  /**
   * 转换规则
   * regex: 正则表达式
   * getid: 获取 ID
   */
  transformation?: "regex" | "trim";

  /**
   * 转换参数
   */
  transformationArgs?: string[];
};
