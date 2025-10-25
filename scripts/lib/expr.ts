/**
 * Expression
 */

// ---- Data ----
// [{ style_name: "style_name_1", color: "color_1" }, { style_name: "style_name_2", color: "color_2" }, ...]
//
// ---- Expressions ----
// {{ $data[n].style_name }}  ["style_name_1", "style_name_2", ...]
// {{ $data[0].style_name }}  "style_name_1"
// {{ key1:$data[n].field1, key2:$data[n].field2 }}  [{key1: "style_name_1", key2: "color_1"}, {key1: "style_name_2", key2: "color_2"}, ...]
// {{ $data[0]["style_name"] }}  "style_name_1"
// {{ $data[0]["color"] }}  "color_1"
//
// ---- Value ----
// {"foo":"bar", "names": "{{ $data[n].style_name }}"}
// "{{ $data[n].style_name }}"
// "{{ $data[0].color }}"
// ["{{ $data[n].total_quantity }}"]  // Array sugar syntax
// {"data": "{{ $data[n].total_quantity }}"}  // Direct property
// {"data": ["{{ $data[n].total_quantity }}"]}  // Array property
//
// ---- Result ----
// {"foo":"bar", "names": ["style_name_1", "style_name_2", ...]}
// ["style_name_1", "style_name_2", ...]
// "color_1"
// [100, 200, 300]  // Result from both array sugar syntax and direct property

export class Expr {
  private data: Array<any> | Record<string, any>;
  private readonly EXPR_START = "{{";
  private readonly EXPR_END = "}}";
  private readonly DATA_TOKEN = "$data";

  constructor(data: Array<any> | Record<string, any>) {
    this.data = data;
  }

  public Exec(value: string | Array<any> | Record<string, any>): any {
    if (typeof value === "string") {
      return this.execString(value);
    } else if (Array.isArray(value)) {
      return this.execArray(value);
    } else if (value && typeof value === "object") {
      return this.execObject(value);
    }
    return value;
  }

  private execString(value: string): any {
    value = value.trim();
    if (!value.startsWith(this.EXPR_START) || !value.endsWith(this.EXPR_END)) {
      return value;
    }

    // Extract expression content
    const expr = value.slice(2, -2).trim();
    if (!expr.includes(this.DATA_TOKEN)) {
      return value;
    }

    try {
      if (expr.includes(":")) {
        return this.parseObjectMapping(expr);
      } else {
        return this.parseDataAccess(expr, value);
      }
    } catch (error) {
      console.error(`Error parsing expression: ${value}`, error);
      return value;
    }
  }

  private execArray(value: Array<any>): Array<any> {
    // Special handling for array with single expression
    if (value.length === 1 && typeof value[0] === "string") {
      const result = this.execString(value[0]);
      // If the result is already an array and it's from [n] expression, return it directly
      if (Array.isArray(result) && value[0].includes("[n]")) {
        return result;
      }
    }
    // Otherwise process each element normally
    return value.map((item) => this.Exec(item));
  }

  private execObject(value: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      // Special handling for array properties
      if (
        Array.isArray(val) &&
        val.length === 1 &&
        typeof val[0] === "string" &&
        val[0].includes("[n]")
      ) {
        // Handle array property with single [n] expression
        result[key] = this.execString(val[0]);
      } else {
        // Normal processing
        result[key] = this.Exec(val);
      }
    }
    return result;
  }

  private parseObjectMapping(expr: string): Array<Record<string, any>> {
    const mappings = expr.split(",").map((m) => m.trim());
    const result: Array<Record<string, any>> = [];

    if (Array.isArray(this.data)) {
      for (const item of this.data) {
        const obj: Record<string, any> = {};
        for (const mapping of mappings) {
          const [key, dataExpr] = mapping.split(":").map((p) => p.trim());
          const parsed = this.evaluateDataExpr(dataExpr, item);
          obj[key] = parsed;
        }
        result.push(obj);
      }
    }

    return result;
  }

  private parseDataAccess(expr: string, originalValue: string): any {
    if (expr.includes("[n]")) {
      // Handle array mapping
      if (Array.isArray(this.data)) {
        const field = expr.split("[n]")[1].replace(/^\./, "");
        return this.data.map((item) => this.getNestedValue(item, field));
      }
    } else {
      // Handle single item access
      const indexMatch = expr.match(/\[(\d+)\]/);
      if (indexMatch && Array.isArray(this.data)) {
        const index = parseInt(indexMatch[1], 10);
        const item = this.data[index];
        if (item) {
          const field = expr.split(/\[\d+\]/)[1].replace(/^\./, "");
          return this.getNestedValue(item, field);
        }
      }
    }
    return originalValue;
  }

  private evaluateDataExpr(expr: string, context: any): any {
    const field = expr.replace(this.DATA_TOKEN, "").replace(/^\[n\]\./, "");
    return this.getNestedValue(context, field);
  }

  private getNestedValue(obj: any, path: string): any {
    const parts = path
      .replace(/\[["'](.+?)["']\]/g, ".$1")
      .split(".")
      .filter(Boolean);

    let result = obj;
    for (const part of parts) {
      if (result == null) return undefined;
      result = result[part];
    }
    return result;
  }
}
