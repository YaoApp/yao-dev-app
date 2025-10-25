/**
 * Table Manager
 */

import { Exception, FS, log, Process } from "@yao/runtime";
import { FileToID, IDToFile, WithPrefix } from "./utils";

/**
 * Table Manager
 */
export class Table {
  private file: string;
  private fs: FS;
  private id: string;
  private prefix: string;

  constructor(file: string, prefix: string = "ai") {
    // Fix file path
    !file.startsWith("/") && (file = `/${file}`);

    if (!file.endsWith(".tab.yao")) {
      log.Error(`[Table] Invalid file path: ${file}`);
      console.log(file);
      throw new Exception(`Invalid file path`, 400);
    }

    if (!file.startsWith("/tables")) {
      log.Error(`[Table] Invalid file path: ${file}`);
      throw new Exception("Invalid file path", 400);
    }

    this.file = file;
    this.prefix = prefix;
    this.fs = new FS("app");
    this.id = FileToID(file);
  }

  /**
   * List all tables
   * @param options Options
   * @param options.metadata Include metadata
   * @param options.columns Include columns
   * @returns
   */
  static List(options: { metadata?: boolean; columns?: boolean } = {}) {
    return Process(`table.list`, options);
  }

  /**
   * Get a table by id
   * @param id Table ID
   * @param options Options
   * @param options.metadata Include metadata
   * @param options.columns Include columns
   * @returns Table
   */
  static DSL(id: string) {
    return Process(`yao.table.dsl`, id);
  }

  /**
   * Check if a table exists by id
   * @param id Table ID
   * @returns true if the table exists, false otherwise
   */
  static Exists(id: string) {
    return Process(`yao.table.exists`, id);
  }

  /**
   * Check if a pathname is a table
   * @param pathname Pathname
   * @returns true if the pathname is a table, false otherwise
   */
  static PathIsTable(pathname: string): boolean {
    pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
    if (pathname.toLocaleLowerCase().startsWith("/x/table")) {
      return true;
    }
    return false;
  }

  /**
   * Get the table name from a pathname
   * @param pathname Pathname
   * @returns Table name
   */
  static GetTableID(pathname: string): string | undefined {
    if (!Table.PathIsTable(pathname)) {
      return undefined;
    }
    return pathname.split("/").pop();
  }

  /**
   * Get the bind model from a pathname
   * @test yao run scripts.lib.table.GetBindModel "/x/table/product"
   * @param pathname Pathname
   * @returns Bind model
   */
  static GetBindModel(pathname: string): string | undefined {
    // Get table dsl
    try {
      const table_id = Table.GetTableID(pathname);
      const dsl = Table.DSL(table_id);
      if (!dsl || !dsl.action || !dsl.action.bind || !dsl.action.bind.model) {
        return undefined;
      }
      return dsl.action.bind.model;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Create a new table from DSL id
   * @param id Table ID
   * @param prefix Prefix
   * @returns Table
   */
  static Open(id: string, prefix: string = "ai") {
    const file = IDToFile("table", WithPrefix(id, prefix));
    return new Table(file, prefix);
  }

  /**
   * Check if the table exists
   * @returns true if the table exists, false otherwise
   */
  Exists() {
    return this.fs.Exists(this.file);
  }

  /**
   * Save the table to file
   * @param raw Content
   */
  SaveToFile(raw: string) {
    this.fs.WriteFile(this.file, raw);
    return this;
  }

  /**
   * Load the table
   * @param source Source
   * @returns Table
   */
  Load(source?: string) {
    if (source) {
      Process(`yao.table.load`, this.id, this.file, source);
      return this;
    }
    const res = Process(`yao.table.load`, this.file);
    console.log("-- Load Table ----");
    console.log(this.id, this.file, res);
    console.log("-------");
    return this;
  }

  /**
   * Reload the table
   * @returns Table
   */
  Reload() {
    Process(`yao.table.reload`, this.id);
    return this;
  }

  /**
   * Validate the table DSL
   * @param dsl Table DSL
   * @returns true if the table DSL is valid, false otherwise
   */
  Validate(dsl: Record<string, any>) {
    const errors: string[] = [];

    // Check if dsl is an object
    if (!dsl || typeof dsl !== "object" || Array.isArray(dsl)) {
      errors.push("Table DSL must be an object");
      // Early return since other validations depend on dsl being an object
      if (errors.length > 0) {
        throw new Exception(errors.join("\n"), 400);
      }
    }

    // Check required fields according to schema
    if (!dsl.name) {
      errors.push("Error at path: name - Table name is required");
    }

    if (!dsl.action) {
      errors.push("Error at path: action - Table action is required");
    }

    // Validate action if present
    if (dsl.action) {
      if (typeof dsl.action !== "object") {
        errors.push("Error at path: action - Action must be an object");
      } else {
        // Check required bind in action
        if (!dsl.action.bind) {
          errors.push("Error at path: action.bind - Action bind is required");
        }
      }
    }

    // Validate layout if present
    if (dsl.layout) {
      if (typeof dsl.layout !== "object") {
        errors.push("Error at path: layout - Layout must be an object");
      } else {
        // Check required header in layout
        if (!dsl.layout.header) {
          errors.push(
            "Error at path: layout.header - Layout header is required"
          );
        }

        // 如果header不存在，则创建一个默认的header
        dsl.layout.header = { preset: {} };
        // Validate header if present
        // if (dsl.layout.header && typeof dsl.layout.header !== "object") {
        //   errors.push(
        //     "Error at path: layout.header - Header must be an object"
        //   );
        // }

        // Validate filter if present
        if (dsl.layout.filter && typeof dsl.layout.filter !== "object") {
          errors.push(
            "Error at path: layout.filter - Filter must be an object"
          );
        }

        // Validate table layout if present
        if (dsl.layout.table) {
          if (typeof dsl.layout.table !== "object") {
            errors.push(
              "Error at path: layout.table - Table layout must be an object"
            );
          } else if (dsl.layout.table.operation) {
            // Validate operation if present
            if (typeof dsl.layout.table.operation !== "object") {
              errors.push(
                "Error at path: layout.table.operation - Operation must be an object"
              );
            } else if (!dsl.layout.table.operation.actions) {
              errors.push(
                "Error at path: layout.table.operation.actions - Operation actions are required"
              );
            }
          }
        }
      }
    }

    // Validate fields if present
    if (dsl.fields) {
      if (typeof dsl.fields !== "object") {
        errors.push("Error at path: fields - Fields must be an object");
      } else {
        // Validate filter fields if present
        if (dsl.fields.filter && typeof dsl.fields.filter !== "object") {
          errors.push(
            "Error at path: fields.filter - Filter fields must be an object"
          );
        }

        // Validate table fields if present
        if (dsl.fields.table && typeof dsl.fields.table !== "object") {
          errors.push(
            "Error at path: fields.table - Table fields must be an object"
          );
        }
      }
    }

    // Validate config if present
    if (dsl.config) {
      if (typeof dsl.config !== "object") {
        errors.push("Error at path: config - Config must be an object");
      } else if (
        dsl.config.full !== undefined &&
        typeof dsl.config.full !== "boolean"
      ) {
        errors.push("Error at path: config.full - Full must be a boolean");
      }
    }

    // Throw all collected errors if any
    if (errors.length > 0) {
      throw new Exception(errors.join("\n"), 400);
    }

    return true;
  }
}
