/**
 * Data Model Manager
 */

import { agent, Exception, FS, log, Process } from "@yao/runtime";
import { FileToID, IDToFile, WithPrefix } from "./utils";

const __RelatedModels = [
  "category",
  "customer",
  "designer",
  "order",
  "product",
  "sku",
  "staff",
  "store",
  "style",
];

/**
 * Get related models
 * @param context Context
 * @returns Related models
 */
export function RelatedModels(context?: agent.Context) {
  return __RelatedModels;
}

/**
 * Data Model Manager
 */
export class Model {
  private file: string;
  private fs: FS;
  private id: string;
  private prefix: string;

  constructor(file: string, prefix: string = "ai") {
    // Fix file path
    !file.startsWith("/") && (file = `/${file}`);

    if (!file.endsWith(".mod.yao")) {
      log.Error(`[Model] Invalid file path: ${file}`);
      console.log(file);
      throw new Exception(`Invalid file path`, 400);
    }

    if (!file.startsWith("/models")) {
      log.Error(`[Model] Invalid file path: ${file}`);
      throw new Exception("Invalid file path", 400);
    }

    this.file = file;
    this.prefix = prefix;
    this.fs = new FS("app");
    this.id = FileToID(file);
  }

  /**
   * List all models
   * @param options Options
   * @param options.metadata Include metadata
   * @param options.columns Include columns
   * @returns
   */
  static List(options: { metadata?: boolean; columns?: boolean } = {}) {
    return Process(`model.list`, options);
  }

  /**
   * Get summaries of all models
   * @returns Model summaries
   */
  static Summaries(filters?: { models: string[] }): Summary[] {
    const models = [];
    for (const model of Model.List({ columns: true, metadata: true })) {
      if (filters?.models && !filters.models.includes(model.id)) {
        continue;
      }

      const columns = [];
      for (const v in model.columns) {
        const column = model.columns[v];
        columns.push({
          name: column.name,
          type: column.type,
          label: column.label,
        });
      }

      const summary: Summary = {
        id: model.id,
        name: model.name,
        description: model.description,
        columns,
      };

      if (model.metadata?.relations) {
        summary.relations = model.metadata.relations;
      }
      models.push(summary);
    }
    return models;
  }

  /**
   * Get samples of a model (first 5 records)
   * @param models Model IDs
   * @param n Number of records
   * @returns Samples
   */
  static GetSamples(
    models: string[] | Record<string, any>[],
    n: number = 5
  ): Record<string, Record<string, any>[]> {
    const ids = [];
    const samples: Record<string, Record<string, any>[]> = {};
    models.forEach((model) => {
      if (typeof model === "string") {
        ids.push(model);
        return;
      }
      if (model.id) ids.push(model.id);
    });

    n = n < 1 ? 1 : n;
    n = n > 20 ? 20 : n;
    ids?.forEach((id) => {
      const get = `models.${id}.Get`;
      const rows = Process(get, { limit: n });
      samples[id] = rows;
    });
    return samples;
  }

  /**
   * Get a model by id
   * @param id Model ID
   * @param options Options
   * @param options.metadata Include metadata
   * @param options.columns Include columns
   * @returns Model
   */
  static Get(
    id: string,
    options: { metadata?: boolean; columns?: boolean } = {}
  ) {
    id = id.toLowerCase();
    return Process(`model.dsl`, id, options);
  }

  static Exists(id: string) {
    id = id.toLowerCase();
    return Process(`model.exists`, id);
  }

  /**
   * Create a new model from DSL id
   * @param id Model ID
   * @param prefix Prefix
   * @returns Model
   */
  static Open(id: string, prefix: string = "ai") {
    id = id.toLowerCase();
    const file = IDToFile("model", WithPrefix(id, prefix));
    return new Model(file, prefix);
  }

  /**
   * Create a snapshot of the model
   * @param id Model ID
   * @returns Model
   */
  static Snapshot(id: string, inMemory: boolean = false) {
    const method = `models.${id}.TakeSnapshot`;
    return Process(method, inMemory);
  }

  /**
   * Drop a snapshot of the model
   * @param model Model
   * @param id Snapshot ID
   * @returns Model
   */
  static DropSnapshot(name: string, model: string = null) {
    if (!model) {
      model = name.split("_snapshot_")[0];
      // Check if model is valid
      if (!Model.Exists(model)) {
        throw new Exception(`Model ${model} not found`, 400);
      }
    }
    const method = `models.${model}.DropSnapshot`;
    return Process(method, name);
  }

  /**
   * Restore a snapshot of the model
   * @param id Model ID
   * @param snapshot Snapshot
   * @param rename If true, restore the snapshot by renaming the snapshot table name
   * @returns Model
   */
  static Restore(id: string, snapshot: string, rename: boolean = false) {
    let method = `models.${id}.RestoreSnapshot`;
    if (rename) {
      method = `models.${id}.RestoreSnapshotByRename`;
    }
    return Process(method, snapshot);
  }

  /**
   * Migrate the model
   * @param id Model ID
   * @param force If true, force migrate the model
   * @returns Model
   */
  static Migrate(id: string, force: boolean = false) {
    let method = `models.${id}.Migrate`;
    return Process(method, force);
  }

  /**
   * Read the model
   * @returns Model
   */
  Read(): string {
    return this.fs.ReadFile(this.file);
  }

  /**
   * Check if the model exists
   * @returns true if the model exists, false otherwise
   */
  Exists() {
    return this.fs.Exists(this.file);
  }

  /**
   * Create the model
   * @param content Content
   */
  SaveToFile(raw: string) {
    this.fs.WriteFile(this.file, raw);
    return this;
  }

  /**
   * Load the model
   * @param source Source
   * @returns Model
   */
  Load(source?: string) {
    if (source) {
      Process(`models.${this.id}.Load`, this.file, source);
      return this;
    }

    console.log("-- Load Model ----");
    console.log(this.id, this.file);
    console.log("-------");
    Process(`models.${this.id}.Load`, this.file);
    return this;
  }

  /**
   * Reload the model
   * @returns Model
   */
  Reload() {
    Process(`models.${this.id}.Reload`);
    return this;
  }

  /**
   * Migrate the model
   * @param source Source
   * @returns Model
   */
  Migrate(force: boolean = false) {
    Process(`models.${this.id}.Migrate`, true);
    return this;
  }

  /**
   * Validate the model DSL
   * @param dsl Model DSL
   * @returns true if the model DSL is valid, false otherwise
   */
  Validate(dsl: Record<string, any>) {
    const errors: string[] = [];

    // Check if dsl is an object
    if (!dsl || typeof dsl !== "object" || Array.isArray(dsl)) {
      errors.push("Model DSL must be an object");
      // Early return since other validations depend on dsl being an object
      if (errors.length > 0) {
        throw new Exception(errors.join("\n"), 400);
      }
    }

    // Check required fields
    if (!dsl.name) {
      errors.push("Error at path: name - Model name is required");
    }

    if (!dsl.label) {
      errors.push("Error at path: label - Model label is required");
    }

    // Validate connector if present
    if (dsl.connector !== undefined && typeof dsl.connector !== "string") {
      errors.push("Error at path: connector - Connector must be a string");
    }

    // Validate columns
    if (
      !dsl.columns ||
      !Array.isArray(dsl.columns) ||
      dsl.columns.length === 0
    ) {
      errors.push(
        "Error at path: columns - Model must have at least one column"
      );
    } else {
      // Validate each column
      for (let i = 0; i < dsl.columns.length; i++) {
        const column = dsl.columns[i];
        const columnPath = `columns[${i}]`;

        // Check required column fields
        if (!column.name) {
          errors.push(
            `Error at path: ${columnPath}.name - Column is missing name`
          );
        }

        if (!column.label) {
          errors.push(
            `Error at path: ${columnPath}.label - Column '${
              column.name || "unnamed"
            }' is missing label`
          );
        }

        if (!column.type) {
          errors.push(
            `Error at path: ${columnPath}.type - Column '${
              column.name || "unnamed"
            }' is missing type`
          );
        } else {
          // Validate column type
          const validColumnTypes = [
            "string",
            "char",
            "text",
            "mediumText",
            "longText",
            "binary",
            "date",
            "datetime",
            "datetimeTz",
            "time",
            "timeTz",
            "timestamp",
            "timestampTz",
            "tinyInteger",
            "tinyIncrements",
            "unsignedTinyInteger",
            "smallInteger",
            "smallIncrements",
            "unsignedSmallInteger",
            "integer",
            "increments",
            "unsignedInteger",
            "bigInteger",
            "bigIncrements",
            "unsignedBigInteger",
            "id",
            "ID",
            "decimal",
            "unsignedDecimal",
            "float",
            "unsignedFloat",
            "double",
            "unsignedDouble",
            "boolean",
            "enum",
            "json",
            "JSON",
            "jsonb",
            "JSONB",
            "uuid",
            "ipAddress",
            "macAddress",
            "year",
            "vector",
          ];

          if (!validColumnTypes.includes(column.type)) {
            errors.push(
              `Error at path: ${columnPath}.type - Column '${
                column.name || "unnamed"
              }' has invalid type: ${column.type}`
            );
          }

          // Validate enum type
          if (
            column.type === "enum" &&
            (!column.option ||
              !Array.isArray(column.option) ||
              column.option.length === 0)
          ) {
            errors.push(
              `Error at path: ${columnPath}.option - Column '${
                column.name || "unnamed"
              }' of type 'enum' must have options defined`
            );
          }

          // Validate numeric types precision and scale
          if (
            [
              "decimal",
              "unsignedDecimal",
              "float",
              "unsignedFloat",
              "double",
              "unsignedDouble",
            ].includes(column.type)
          ) {
            if (
              column.precision !== undefined &&
              (typeof column.precision !== "number" || column.precision <= 0)
            ) {
              errors.push(
                `Error at path: ${columnPath}.precision - Column '${
                  column.name || "unnamed"
                }' has invalid precision: ${column.precision}`
              );
            }

            if (
              column.scale !== undefined &&
              (typeof column.scale !== "number" || column.scale < 0)
            ) {
              errors.push(
                `Error at path: ${columnPath}.scale - Column '${
                  column.name || "unnamed"
                }' has invalid scale: ${column.scale}`
              );
            }

            if (
              column.scale !== undefined &&
              column.precision !== undefined &&
              column.scale > column.precision
            ) {
              errors.push(
                `Error at path: ${columnPath}.scale - Column '${
                  column.name || "unnamed"
                }' scale cannot be greater than precision`
              );
            }
          }

          // Validate string types length
          if (
            ["string", "char"].includes(column.type) &&
            column.length !== undefined
          ) {
            if (typeof column.length !== "number" || column.length <= 0) {
              errors.push(
                `Error at path: ${columnPath}.length - Column '${
                  column.name || "unnamed"
                }' has invalid length: ${column.length}`
              );
            }
          }
        }

        // Validate validations if present
        if (column.validations && Array.isArray(column.validations)) {
          for (let j = 0; j < column.validations.length; j++) {
            const validation = column.validations[j];
            const validationPath = `${columnPath}.validations[${j}]`;

            if (!validation.method) {
              errors.push(
                `Error at path: ${validationPath}.method - Validation for column '${
                  column.name || "unnamed"
                }' is missing method`
              );
            } else {
              const validMethods = [
                "typeof",
                "min",
                "max",
                "enum",
                "pattern",
                "minLength",
                "maxLength",
                "email",
                "mobile",
              ];

              if (!validMethods.includes(validation.method)) {
                errors.push(
                  `Error at path: ${validationPath}.method - Validation method '${
                    validation.method
                  }' for column '${column.name || "unnamed"}' is invalid`
                );
              }

              // Check if args is present for methods that require it
              if (
                [
                  "min",
                  "max",
                  "enum",
                  "pattern",
                  "minLength",
                  "maxLength",
                  "typeof",
                ].includes(validation.method) &&
                (!validation.args ||
                  !Array.isArray(validation.args) ||
                  validation.args.length === 0)
              ) {
                errors.push(
                  `Error at path: ${validationPath}.args - Validation method '${
                    validation.method
                  }' for column '${
                    column.name || "unnamed"
                  }' requires arguments`
                );
              }
            }
          }
        }

        // Validate crypt if present
        if (column.crypt && !["AES", "PASSWORD"].includes(column.crypt)) {
          errors.push(
            `Error at path: ${columnPath}.crypt - Column '${
              column.name || "unnamed"
            }' has invalid crypt method: ${column.crypt}`
          );
        }
      }
    }

    // Validate table if present
    if (dsl.table && typeof dsl.table === "object") {
      const table = dsl.table as {
        name?: string;
        prefix?: string;
        engine?: string;
        collation?: string;
        charset?: string;
        primaryKeys?: string[];
      };

      // Validate table engine if present
      if (table.engine && !["InnoDB", "MyISAM"].includes(table.engine)) {
        errors.push(
          `Error at path: table.engine - Table engine '${table.engine}' is invalid. Allowed values: InnoDB, MyISAM`
        );
      }

      // Validate primaryKeys if present
      if (
        table.primaryKeys &&
        (!Array.isArray(table.primaryKeys) || table.primaryKeys.length === 0)
      ) {
        errors.push(
          "Error at path: table.primaryKeys - Table primaryKeys must be a non-empty array"
        );
      }
    }

    // Validate indexes if present
    if (dsl.indexes) {
      if (!Array.isArray(dsl.indexes)) {
        errors.push("Error at path: indexes - Indexes must be an array");
      } else {
        for (let i = 0; i < dsl.indexes.length; i++) {
          const index = dsl.indexes[i];
          const indexPath = `indexes[${i}]`;

          if (
            !index.columns ||
            !Array.isArray(index.columns) ||
            index.columns.length === 0
          ) {
            errors.push(
              `Error at path: ${indexPath}.columns - Index must have columns defined`
            );
          }

          if (
            index.type &&
            !["primary", "unique", "index", "match"].includes(index.type)
          ) {
            errors.push(
              `Error at path: ${indexPath}.type - Index type '${index.type}' is invalid`
            );
          }
        }
      }
    }

    // Validate relations if present
    if (dsl.relations && typeof dsl.relations === "object") {
      for (const [relationName, relationObj] of Object.entries(dsl.relations)) {
        const relationPath = `relations.${relationName}`;

        if (!relationObj || typeof relationObj !== "object") {
          errors.push(
            `Error at path: ${relationPath} - Relation must be an object`
          );
          continue;
        }

        // Type assertion to access properties safely
        const relation = relationObj as {
          type?: string;
          key?: string;
          model?: string;
          foreign?: string;
          query?: Record<string, any>;
        };

        if (!relation.type) {
          errors.push(
            `Error at path: ${relationPath}.type - Relation is missing type`
          );
        } else if (
          !["hasOne", "hasMany", "hasOneThrough"].includes(relation.type)
        ) {
          errors.push(
            `Error at path: ${relationPath}.type - Relation has invalid type: ${relation.type}`
          );
        }

        if (!relation.key) {
          errors.push(
            `Error at path: ${relationPath}.key - Relation is missing key`
          );
        }

        if (!relation.model) {
          errors.push(
            `Error at path: ${relationPath}.model - Relation is missing model`
          );
        }

        if (!relation.foreign) {
          errors.push(
            `Error at path: ${relationPath}.foreign - Relation is missing foreign key`
          );
        }

        // Validate query if present
        if (relation.query && typeof relation.query !== "object") {
          errors.push(
            `Error at path: ${relationPath}.query - Relation query must be an object`
          );
        }
      }
    }

    // Validate values if present
    if (dsl.values !== undefined) {
      if (!Array.isArray(dsl.values)) {
        errors.push("Error at path: values - Values must be an array");
      }
    }

    // Validate option if present
    if (dsl.option && typeof dsl.option === "object") {
      const validOptions = [
        "timestamps",
        "soft_deletes",
        "trackings",
        "constraints",
        "permission",
        "logging",
        "read_only",
      ];

      for (const [key, value] of Object.entries(dsl.option)) {
        const optionPath = `option.${key}`;

        if (!validOptions.includes(key)) {
          errors.push(`Error at path: ${optionPath} - Option is not valid`);
        }

        if (typeof value !== "boolean") {
          errors.push(
            `Error at path: ${optionPath} - Option must be a boolean value`
          );
        }
      }
    }

    // Validate custom if present
    if (
      dsl.custom !== undefined &&
      (typeof dsl.custom !== "object" || Array.isArray(dsl.custom))
    ) {
      errors.push("Error at path: custom - Custom must be an object");
    }

    // Throw all collected errors if any
    if (errors.length > 0) {
      throw new Exception(errors.join("\n"), 400);
    }

    return true;
  }
}

type Summary = {
  id: string;
  name: string;
  description: string;
  relations?: Record<string, any>;
  columns?: {
    name: string;
    type: string;
    label: string;
  }[];
};
