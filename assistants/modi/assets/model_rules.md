# Model Rules

This is a background material about model, you need to strictly follow these rules.

## Structure

```TypeScript
/**
 * Data Model Definition
 */
interface DataModel {
  /** Model name in Chinese */
  name: string;
  /** Table definition */
  table: TableDefinition;
  /** Column definitions */
  columns: ColumnDefinition[];
  /** Index definitions */
  indexes?: IndexDefinition[];
  /** Relationship mappings */
  relations?: { [key: string]: RelationDefinition };
  /** Default values */
  values?: any[];
  /** Model options */
  option?: ModelOption;
}

/**
 * Table Definition
 */
interface TableDefinition {
  /** Table name */
  name: string;
  /** Table comment */
  comment?: string;
}

/**
 * Column Definition
 */
interface ColumnDefinition {
  /** Column display label */
  label: string;
  /** Column name */
  name: string;
  /** Column data type */
  type: ColumnType;
  /** Column comment */
  comment?: string;
  /** Column title */
  title?: string;
  /** Column description */
  description?: string;
  /** Column length for string types */
  length?: number;
  /** Total digits including decimal places for float/decimal types */
  precision?: number;
  /** Number of decimal places for float/decimal types */
  scale?: number;
  /** Allowed values for enum type */
  option?: string[];
  /** Default value */
  default?: string | number | boolean;
  /** Default value using database function */
  default_raw?: string;
  /** Encryption method (MySQL only). Allowed: 'AES', 'PASSWORD' */
  crypt?: 'AES' | 'PASSWORD';
  /** Whether the column can be null */
  nullable?: boolean;
  /** Whether to create an index */
  index?: boolean;
  /** Whether to create a unique index */
  unique?: boolean;
  /** Whether this is the primary key */
  primary?: boolean;
  /** Validation rules */
  validations?: ValidationRule[];
}

/**
 * Column Types
 */
type ColumnType =
  | 'ID'
  | 'string'
  | 'char'
  | 'text'
  | 'mediumText'
  | 'longText'
  | 'binary'
  | 'date'
  | 'datetime'
  | 'datetimeTz'
  | 'time'
  | 'timeTz'
  | 'timestamp'
  | 'timestampTz'
  | 'tinyInteger'
  | 'tinyIncrements'
  | 'unsignedTinyInteger'
  | 'smallInteger'
  | 'smallIncrements'
  | 'unsignedSmallInteger'
  | 'integer'
  | 'increments'
  | 'unsignedInteger'
  | 'bigInteger'
  | 'bigIncrements'
  | 'unsignedBigInteger'
  | 'decimal'
  | 'unsignedDecimal'
  | 'float'
  | 'unsignedFloat'
  | 'double'
  | 'unsignedDouble'
  | 'boolean'
  | 'enum'
  | 'json'
  | 'jsonb'
  | 'uuid'
  | 'ipAddress'
  | 'macAddress'
  | 'year';

/**
 * Validation Rule
 */
interface ValidationRule {
  /** Validation method */
  method: ValidationMethod;
  /** Method arguments */
  args?: (string | number)[];
  /** Error message */
  message?: string;
}

/**
 * Validation Methods
 */
type ValidationMethod =
  | 'typeof'
  | 'min'
  | 'max'
  | 'enum'
  | 'pattern'
  | 'minLength'
  | 'maxLength'
  | 'email'
  | 'mobile';

/**
 * Index Definition
 */
interface IndexDefinition {
  /** Index name */
  name: string;
  /** Index type */
  type: 'index' | 'unique' | 'primary' ;
  /** Columns to be indexed */
  columns: string[];
  /** Index comment */
  comment?: string;
}

/**
 * Relation Definition
 */
interface RelationDefinition {
  /** Relation type */
  type: 'hasOne' | 'hasMany' ;
  /** Related model name */
  model?: string;
  /** Foreign key in related model */
  key?: string;
  /** Local key */
  foreign?: string;
  /** Default query parameters */
  query?: QueryParam;
  /** Through relations for hasOneThrough/hasManyThrough */
  links?: RelationDefinition[];
}

/**
 * Model Options
 */
interface ModelOption {
  /** Whether to add timestamps (created_at, updated_at) */
  timestamps?: boolean;
  /** Whether to enable soft deletes */
  soft_deletes?: boolean;
}
```

## Rules

1. Must have at least one column.
2. Must have a primary key column type of `ID`.
   2.1 type of `ID` do not allow to have `nullable`, `index`, `unique`, and `default` properties.
3. Only one primary key column is allowed.
4. ModelOption must be defined and include `timestamps` and `soft_deletes`.
5. created_at, updated_at, and deleted_at columns not allowed in the columns.
