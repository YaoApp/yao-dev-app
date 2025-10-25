import { agent, Eval, Exception, FS, Process } from "@yao/runtime";

const roots = {
  model: "/models",
  table: "/tables",
  form: "/forms",
};

const extensions = {
  model: ".mod.yao",
  table: ".tab.yao",
  form: ".form.yao",
};

const extensionTypes = {
  mod: "model",
  tab: "table",
  form: "form",
};

export function GetDSLType(filepath: string): DSLType {
  const parts = filepath.split(".");
  if (parts.length < 2) {
    throw new Exception("Invalid file path", 400);
  }
  const type = extensionTypes[parts[parts.length - 2]];
  if (!type) {
    console.log(parts);
    throw new Exception("Invalid file path", 400);
  }
  return type;
}

/**
 * Convert file path to DSL ID
 * @param type DSL type
 * @param filepath File path
 * @returns DSL ID
 */
export function FileToID(filepath: string): string {
  filepath = filepath.toLowerCase();
  const type = GetDSLType(filepath);
  const extension = extensions[type];

  const root = roots[type];
  !filepath.startsWith("/") && (filepath = `/${filepath}`);

  // remove root
  filepath = filepath.replace(new RegExp(`^${root}`), "");

  // remove extension
  filepath = filepath.replace(
    new RegExp(`${extension?.replace(/\./g, "\\.")}$`),
    ""
  );

  const id = filepath.replace(/\//g, ".").replace(/^\./, "");
  return id;
}

/**
 * Convert DSL ID to file path
 * @param type DSL type
 * @param id DSL ID
 * @returns File path
 */
export function IDToFile(type: DSLType, id: string): string {
  id = id.toLowerCase();
  const root = roots[type];
  const extension = extensions[type];
  return `${root}/${id.replace(/\./g, "/")}${extension}`;
}

/**
 * Get the Yao mode
 * @returns Yao mode
 */
export function YaoMode() {
  return Process("utils.env.Get", "YAO_ENV") || "development";
}

type DSLType = "model" | "table" | "form";

/**
 * Parse JSON, if failed, try to repair it
 * @param json JSON string
 * @returns Parsed JSON
 */
export function ParseJSON(json: string): any {
  return Process("encoding.json.Parse", json);
}

/**
 * Replace text with patch
 *
 * @test yao run scripts.lib.utils.Patch
 * @param text Text
 * @param patch Patch
 * @returns Patched text
 */
export function Replace(text: string, patch: string): string {
  return Process("diff.Replace", text, patch);
}

/**
 * Add prefix to ID
 * @param id ID
 * @param prefix Prefix
 * @returns ID with prefix
 */
export function WithPrefix(id: string, prefix: string): string {
  id = id.toLowerCase();
  if (prefix) {
    return `${prefix}.${id}`;
  }
  return id;
}

/**
 * Generate a UUID
 * @test yao run scripts.lib.utils.UUID
 * @returns UUID
 */
export function UUID(): string {
  return Process("utils.str.UUID");
}

/**
 * Generate a numeric unique ID using timestamp and UUID
 * @test yao run scripts.lib.utils.UniqueID
 *
 * Collision probability analysis:
 * - Time component: millisecond timestamp
 * - Random component: random numbers from UUID
 * - Potential collisions may occur if:
 *   1. Multiple IDs are generated in the same millisecond
 *   2. The UUID random part generates the same digits
 *
 * To minimize collisions:
 * - Use high precision timestamp from Date.now()
 * - Extract multiple random digits from UUID as backup
 * - Ensure first digit is never 0
 *
 * @param digits The total number of digits for the ID (default: 10)
 *              Time component will take 60% of digits, random part takes 40%
 * @returns Numeric unique ID with specified number of digits
 */
export function UniqueID(digits: number = 10): string {
  if (digits < 6) {
    throw new Exception(
      "Minimum 6 digits required for reliable unique IDs",
      400
    );
  }

  // Calculate component sizes
  const timeDigits = Math.ceil(digits * 0.6); // 60% for timestamp
  const randomDigits = digits - timeDigits; // 40% for random part

  // Get high-precision timestamp
  const timestamp = Date.now();

  // Calculate the range for the first digit (1-9)
  const minFirstDigit = Math.pow(10, timeDigits - 1);
  const maxFirstDigit = Math.pow(10, timeDigits) - 1;

  // Ensure time component starts with non-zero digit
  let timeComponent = timestamp % maxFirstDigit;
  if (timeComponent < minFirstDigit) {
    timeComponent += minFirstDigit;
  }

  // Get UUID and extract more random digits as backup
  const uuid = UUID().replace(/-/g, "");
  const numbers = uuid.replace(/[a-f]/g, "");

  // Get primary and backup random digits
  const primaryRandom = numbers.slice(0, randomDigits);
  const backupRandom = numbers.slice(randomDigits, randomDigits * 2);

  // If primary random part starts with 0, use backup to avoid leading zeros
  const randomPart = primaryRandom.startsWith("0")
    ? backupRandom
    : primaryRandom;

  // Combine time component and random component
  const id = `${timeComponent.toString()}${randomPart.slice(0, randomDigits)}`;

  return id;
}

/**
 * Humanize bytes
 * @param bytes Bytes
 * @returns Humanized bytes
 */
export function HumanizeBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let size = bytes;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }

  return `${size.toFixed(2)} ${units[index]}`;
}

/**
 * Convert date to Yao datetime string
 * @param date Date
 * @returns Yao datetime string
 * @test yao run scripts.lib.utils.DatetimeToDB
 */
export function DatetimeToDB(date?: Date): string {
  date = date || new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().replace("T", " ").replace("Z", "");
}
