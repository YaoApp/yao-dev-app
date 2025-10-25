# Expression Parser

A template expression parser that processes dynamic expressions in data templates. It supports data extraction and transformation from data sources, suitable for generating dynamic configurations, template rendering, and more.

## Basic Syntax

The expression uses `{{ }}` as delimiters and `$data` to access the data source.

### Data Source Example

```javascript
const data = [
  { style_name: "style_1", color: "red", size: { width: 100, height: 200 } },
  { style_name: "style_2", color: "blue", size: { width: 150, height: 250 } },
];
```

## Expression Types

### 1. Array Mapping Expression

Extract specified fields from an array to generate a new array.

```javascript
// Syntax
"{{ $data[n].field_name }}";

// Example
"{{ $data[n].style_name }}";
// Result: ["style_1", "style_2"]

// Access nested properties
"{{ $data[n].size.width }}";
// Result: [100, 150]
```

### 2. Single Value Expression

Access specific elements in the array.

```javascript
// Using dot notation
"{{ $data[0].color }}";
// Result: "red"

// Using bracket notation
'{{ $data[1]["color"] }}';
// Result: "blue"

// Access nested properties
"{{ $data[0].size.height }}";
// Result: 200
```

### 3. Object Mapping Expression

Map array elements to a new array of objects.

```javascript
// Map multiple fields
"{{ name:$data[n].style_name, color:$data[n].color }}";
// Result: [
//   { name: "style_1", color: "red" },
//   { name: "style_2", color: "blue" }
// ]

// Map nested objects
"{{ name:$data[n].style_name, dimensions:$data[n].size }}";
// Result: [
//   { name: "style_1", dimensions: { width: 100, height: 200 } },
//   { name: "style_2", dimensions: { width: 150, height: 250 } }
// ]
```

### 4. Compound Object Expression

Embed multiple expressions within an object structure.

```javascript
{
  allStyles: "{{ $data[n].style_name }}",
  firstColor: "{{ $data[0].color }}",
  dimensions: {
    widths: "{{ $data[n].size.width }}",
    firstHeight: "{{ $data[0].size.height }}"
  }
}

// Result:
{
  allStyles: ["style_1", "style_2"],
  firstColor: "red",
  dimensions: {
    widths: [100, 150],
    firstHeight: 200
  }
}
```

### 5. Array Expression Sugar Syntax

The parser supports a shorthand syntax for array expressions, particularly useful in configuration objects like charts:

```javascript
// Regular syntax
{
  "data": "{{ $data[n].total_quantity }}"  // Result: [100, 200, 300]
}

// Sugar syntax - automatically unwraps the expression
{
  "data": [
    "{{ $data[n].total_quantity }}"
  ]  // Result: [100, 200, 300]
}

// Example in chart configuration
{
  "series": [
    {
      "data": [
        "{{ $data[n].total_quantity }}"  // Same as "data": "{{ $data[n].total_quantity }}"
      ],
      "type": "bar"
    }
  ]
}
```

This sugar syntax is particularly useful when working with chart libraries or any configuration that expects array data. Both forms produce identical results, choosing between them is a matter of style and context.

## Features

### 1. Whitespace Handling

The expression parser automatically handles whitespace in expressions. The following forms are equivalent:

```javascript
"{{$data[0].color}}";
"{{ $data[0].color }}";
"{{    $data[0].color    }}"`{{
  $data[0].color
}}`;
```

### 2. Error Handling

The expression parser has robust error handling capabilities:

- Invalid expressions: Returns the original string
- Non-existent fields: Returns undefined
- Invalid array indices: Returns the original expression
- Syntax errors: Returns the original string

## Usage

```typescript
import { Expr } from "./expr";

// Create data source
const data = [
  { style_name: "style_1", color: "red" },
  { style_name: "style_2", color: "blue" },
];

// Initialize expression parser
const expr = new Expr(data);

// Execute expression
const result = expr.Exec("{{ $data[n].style_name }}");
console.log(result); // ["style_1", "style_2"]
```

## Testing

Run the test cases:

```bash
yao run scripts.lib.expr_test.TestExpr
```

## Important Notes

1. `$data` is the fixed identifier for accessing the data source
2. Use `[n]` for array iteration, and `[0]`, `[1]`, etc. for specific indices
3. Both dot notation and bracket notation are supported for property access
4. Use commas to separate multiple fields in object mapping
5. Expression parsing does not modify the original data
6. All expressions must be wrapped in `{{ }}` delimiters
7. The parser maintains immutability of the source data

## Type Support

The expression parser supports various data types:

- Strings
- Numbers
- Objects
- Arrays
- Nested structures
- null and undefined values

## Best Practices

1. Always validate the data source structure before processing
2. Use appropriate error handling when processing expressions
3. Consider using type checking for critical data transformations
4. Keep expressions simple and maintainable
5. Use meaningful field names in object mapping
6. Document complex expression patterns
7. Use array sugar syntax in configuration objects for better readability
8. Keep consistent expression style within the same configuration file
