/**
 *  Data Types:
 *
 *  JavaScript -> Golang
 *  ---------------------------------------------------
 *  | JavaScript            | Golang                  |
 *  ---------------------------------------------------
 *  | null                  | nil                     |
 *  | undefined             | bridge.Undefined        |
 *  | boolean               | bool                    |
 *  | number(int)           | int                     |
 *  | number(float)         | float64                 |
 *  | bigint                | int64                   |
 *  | string                | string                  |
 *  | object                | map[string]interface{}  |
 *  | array                 | []interface{}           |
 *  | object(Uint8Array)    | []byte                  |
 *  | object(Promise)       | bridge.Promise          |
 *  | function              | bridge.Function         |
 *  ---------------------------------------------------
 *
 *  Golang -> JavaScript
 *  ---------------------------------------------------
 *  | Golang                  | Javascript            |
 *  ---------------------------------------------------
 *  | nil                     | null                  |
 *  | bool                    | boolean               |
 *  | int                     | number(int)           |
 *  | uint                    | number(int)           |
 *  | uint8                   | number(int)           |
 *  | uint16                  | number(int)           |
 *  | uint32                  | number(int)           |
 *  | int8                    | number(int)           |
 *  | int16                   | number(int)           |
 *  | int32                   | number(int)           |
 *  | float32                 | number(float)         |
 *  | float64                 | number(float)         |
 *  | int64                   | bigint                |
 *  | uint64                  | bigint                |
 *  | string                  | string                |
 *  | map[string]interface{}  | object                |
 *  | []interface{}           | array                 |
 *  | []byte                  | object(Uint8Array)    |
 *  | struct                  | object                |
 *  | func                    | function              |
 *  ---------------------------------------------------
 *
 */

// js: null  go: nil
function ValueOfNull(value) {
  return { typeof: typeof value, check: value === null }; // "object" go: nil
}
function ReturnNull() {
  return null;
}

// js: undefined  go: bridge.Undefined
function ValueOfUndefined(value) {
  return { typeof: typeof value, check: value === undefined }; // "undefined"  go: undefined
}
function ReturnUndefined() {
  return undefined;
}

// js: boolean  go: bool
function ValueOfBoolean(value) {
  return { typeof: typeof value, check: value === true || value === false }; // "boolean"  go: bool
}
function ReturnBoolean() {
  return true;
}

// js: number(int)  go: int
function ValueOfNumberInt(value) {
  return { typeof: typeof value, check: value === 99 }; // "number" | int  go: int
}
function ReturnNumberInt() {
  return 99;
}

// js: number(float)  go: float64
function ValueOfNumberFloat(value) {
  return {
    typeof: typeof value,
    check: value.toFixed(3) === "0.618",
    value: `${value}`,
  }; // "number" | float  go: float64
}
function ReturnNumberFloat() {
  return 0.618;
}

// js: bigint  go: int64
function ValueOfBigInt(value) {
  return { typeof: typeof value, check: value === BigInt(99) }; // "bigint"  go: int64
}
function ReturnBigInt() {
  return BigInt(99);
}

// js: string  go: string
function ValueOfString(value) {
  return { typeof: typeof value, check: value === "hello world" }; // "string"  go: string
}
function ReturnString() {
  return "hello world";
}

// js: object  go: map[string]interface{}
function ValueOfObject(value) {
  const jsValue = {
    string: "foo",
    int: 99,
    bigint: 99,
    float: 0.618,
    nests: { string: "foo", int: 99, float: 0.618, bigint: 99 },
  };

  return {
    typeof: typeof value,
    check: deepEqual(jsValue, value),
    value: jsValue,
  }; // "object"  go: map[string]interface{}
}
function ReturnObject() {
  const jsValue = {
    string: "foo",
    int: 99,
    bigint: 99,
    float: 0.618,
    nests: { string: "foo", int: 99, float: 0.618, bigint: 99 },
  };
  return jsValue;
}

// js: object(array)  go: []interface{}
function ValueOfArray(value) {
  const jsMap = {
    string: "foo",
    int: 99,
    bigint: 99,
    float: 0.618,
    nests: { string: "foo", int: 99, float: 0.618, bigint: 99 },
  };

  const jsArr = ["foo", 99, 0.618, 99, jsMap];
  const jsValue = [...jsArr, jsArr];
  return {
    typeof: typeof value,
    check: deepEqual(value, jsValue),
    value: jsValue,
  };
} // "object" go: []interface{}
function ReturnArray() {
  const jsMap = {
    string: "foo",
    int: 99,
    bigint: 99,
    float: 0.618,
    nests: { string: "foo", int: 99, float: 0.618, bigint: 99 },
  };

  const jsArr = ["foo", 99, 0.618, 99, jsMap];
  const jsValue = [...jsArr, jsArr];
  return jsValue;
}

// js: object(Uint8Array)  go: []byte
function ValueOfUint8Array(value) {
  const bytes = new Uint8Array(1);
  bytes[0] = 0x2a;
  return {
    typeof: typeof value,
    check: value[0] === bytes[0] && value.length == bytes.length,
  }; // "object" go: []byte
}
function ReturnUint8Array() {
  const uint32 = new Uint8Array(1);
  uint32[0] = 0x2a;
  return uint32;
}

function ValueOfStruct(value) {
  const jsValue = {
    String: "foo",
    Int: 99,
    Basic: { String: "bar", Int: 66 },
  };

  return {
    typeof: typeof value,
    check: deepEqual(jsValue, value),
  }; // "object" go: []byte
}

function ValueOfFunction(callback) {
  return callback("hello");
}
function ReturnFunction() {
  return (arg) => {
    return arg;
  };
}

async function ReturnAsync(callback, value) {
  try {
    const res = await callback(value);
    return res;
  } catch (err) {
    return err;
  }
}

function ReturnPromiseString(value) {
  return new Promise((resole, reject) => {
    if (value == "hello") {
      resole(value);
      return;
    }
    reject(new Error("PromiseString Error"));
  });
}

function ReturnPromiseInt(value) {
  value = parseInt(value);
  return new Promise((resole, reject) => {
    if (value == 1) {
      resole(value);
      return;
    }
    reject(new Error("PromiseInt Error"));
  });
}

function deepEqual(x, y) {
  return x && y && typeof x === "object" && typeof y === "object"
    ? Object.keys(x).length === Object.keys(y).length &&
        Object.keys(x).reduce(function (isEqual, key) {
          return isEqual && deepEqual(x[key], y[key]);
        }, true)
    : x === y;
}
