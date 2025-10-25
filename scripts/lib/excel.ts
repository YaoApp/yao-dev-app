import { Process } from "@yao/runtime";

/**
 * Excel class for manipulating Excel files via Yao's Excel Module
 */
export class Excel {
  private handle: string | null = null;

  /**
   * Creates a new Excel instance
   * @param file Path to the Excel file
   */
  constructor(private file: string, writable: boolean = false) {
    this.file = file;
    this.Open(writable);
  }

  /**
   * Read each sheet top n rows
   * @param file Path to the Excel file
   * @param n number of rows to read
   * @returns Object with sheet names as keys and arrays of row values as values
   */
  static Heads(
    file: string,
    n: number = 5,
    filters?: string[]
  ): Record<string, any[][]> {
    const excel = new Excel(file);
    const heads = excel.Heads(n, filters);
    excel.Close();
    return heads;
  }

  /**
   * Read each sheet top n rows
   * @param n number of rows to read
   * @returns Object with sheet names as keys and arrays of row values as values
   * @throws Error if file not opened
   */
  Heads(n: number = 5, filters: string[] = []): Record<string, any[][]> {
    if (!this.handle) throw new Error("Excel file not opened");

    const sheets = this.Sheets();
    const result: Record<string, any[][]> = {};

    for (const sheet of sheets) {
      if (filters.length > 0 && !filters.includes(sheet)) {
        continue;
      }

      // Open row iterator for the sheet
      const iterator = this.each.OpenRow(sheet);
      const rows: any[][] = [];

      // Read n rows
      let row;
      let count = 0;
      while (
        count < n &&
        (row = Process(`excel.each.NextRow`, iterator)) !== null
      ) {
        // Add column headers (A, B, C, ...) for the first row
        if (count === 0) {
          const headerRow = [];
          for (let i = 0; i < row.length; i++) {
            headerRow.push(this.convert.ColumnNumberToName(i + 1));
          }
          rows.push(headerRow);
        }

        // Trim Each cell's value
        row = row.map((cell) => cell?.trim?.());
        rows.push(row);
        count++;
      }

      // Close the row iterator
      this.each.CloseRow(iterator);

      // Find the max length of each row, and pad the column headers(A, B, C, ...) to the same length
      const maxLength = Math.max(...rows.map((row) => row.length));
      const start = rows[0].length;
      const neededLength = maxLength - rows[0].length;
      for (let i = 0; i < neededLength; i++) {
        rows[0].push(this.convert.ColumnNumberToName(start + i + 1));
      }

      // Add the sheet's rows to the result
      result[sheet] = rows;
    }

    return result;
  }

  /**
   * Check if a sheet exists in the Excel file
   * @param file Path to the Excel file
   * @param sheet Sheet name to check
   * @returns boolean - true if sheet exists, false otherwise
   */
  static Exists(file: string, sheet: string) {
    const excel = new Excel(file);
    const exists = excel.sheet.Exists(sheet);
    excel.Close();
    return exists;
  }

  /**
   * Opens an Excel file for reading or writing
   * @param writable Whether to open in writable mode (true) or read-only mode (false)
   * @returns Handle ID used for subsequent operations
   */
  Open(writable: boolean = false) {
    this.handle = Process(`excel.Open`, this.file, writable);
    return this.handle;
  }

  /**
   * Closes the Excel file and releases resources
   * IMPORTANT: Always call this method when done to prevent memory leaks
   */
  Close() {
    if (this.handle) {
      Process(`excel.Close`, this.handle);
      this.handle = null;
    }
  }

  /**
   * Saves changes to the Excel file
   * @throws Error if file not opened
   */
  Save() {
    if (!this.handle) throw new Error("Excel file not opened");
    return Process(`excel.Save`, this.handle);
  }

  /**
   * Gets all sheet names in the workbook
   * @returns Array of sheet names
   * @throws Error if file not opened
   */
  Sheets() {
    if (!this.handle) throw new Error("Excel file not opened");
    return Process(`excel.Sheets`, this.handle);
  }

  // Sheet operations
  sheet = {
    /**
     * Creates a new sheet in the workbook
     * @param name Name for the new sheet
     * @returns number Index of the new sheet
     * @throws Error if file not opened
     */
    Create: (name: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.sheet.create`, this.handle, name);
    },

    /**
     * Lists all sheets in the workbook
     * @returns string[] Array of sheet names
     * @throws Error if file not opened
     */
    List: () => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.sheet.list`, this.handle);
    },

    /**
     * Checks if a sheet exists in the workbook
     * @param name Sheet name to check
     * @returns boolean - true if sheet exists, false otherwise
     * @throws Error if file not opened
     */
    Exists: (name: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.sheet.exists`, this.handle, name);
    },

    /**
     * Reads all data from a sheet
     * @param name Sheet name
     * @returns any[][] Two-dimensional array of cell values
     * @throws Error if file not opened
     */
    Read: (name: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.sheet.read`, this.handle, name);
    },

    /**
     * Reads all data from a sheet with pagination support
     * @param name Sheet name
     * @param from Starting row index (0-based)
     * @param chunk_size Number of rows to read
     * @returns any[][] Two-dimensional array of cell values
     * @throws Error if file not opened
     */
    Rows: (name: string, from: number, chunk_size: number) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.sheet.rows`, this.handle, name, from, chunk_size);
    },

    /**
     * Updates data in a sheet. Creates the sheet if it doesn't exist.
     * @param name Sheet name
     * @param data Two-dimensional array of values to write
     * @throws Error if file not opened
     */
    Update: (name: string, data: any[][]) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.sheet.update`, this.handle, name, data);
    },

    /**
     * Copies a sheet with all its content and formatting
     * @param source Source sheet name
     * @param target Target sheet name (must not exist)
     * @throws Error if file not opened
     */
    Copy: (source: string, target: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.sheet.copy`, this.handle, source, target);
    },

    /**
     * Deletes a sheet from the workbook
     * @param name Sheet name to delete
     * @throws Error if file not opened
     */
    Delete: (name: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.sheet.delete`, this.handle, name);
    },

    /**
     * Gets the dimensions (number of rows and columns) of a sheet
     * @param name Sheet name
     * @returns {rows: number, cols: number} - Object containing row and column counts
     * @throws Error if file not opened
     */
    Dimension: (name: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.sheet.dimension`, this.handle, name);
    },
  };

  // Reading operations
  read = {
    /**
     * Reads a cell's value
     * @param sheet Sheet name
     * @param cell Cell reference (e.g. "A1")
     * @returns Cell value
     * @throws Error if file not opened
     */
    Cell: (sheet: string, cell: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.read.Cell`, this.handle, sheet, cell);
    },

    /**
     * Reads all rows in a sheet
     * @param sheet Sheet name
     * @returns Two-dimensional array of cell values
     * @throws Error if file not opened
     */
    Row: (sheet: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.read.Row`, this.handle, sheet);
    },

    /**
     * Reads all columns in a sheet
     * @param sheet Sheet name
     * @returns Two-dimensional array of cell values
     * @throws Error if file not opened
     */
    Column: (sheet: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.read.Column`, this.handle, sheet);
    },
  };

  // Writing operations
  write = {
    /**
     * Writes a value to a cell
     * @param sheet Sheet name
     * @param cell Cell reference (e.g. "A1")
     * @param value Value to write (string, number, boolean, etc.)
     * @throws Error if file not opened
     */
    Cell: (sheet: string, cell: string, value: any) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.write.Cell`, this.handle, sheet, cell, value);
    },

    /**
     * Writes values to a row starting at the specified cell
     * @param sheet Sheet name
     * @param startCell Starting cell reference (e.g. "A1")
     * @param values Array of values to write
     * @throws Error if file not opened
     */
    Row: (sheet: string, startCell: string, values: any[]) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.write.Row`, this.handle, sheet, startCell, values);
    },

    /**
     * Writes values to a column starting at the specified cell
     * @param sheet Sheet name
     * @param startCell Starting cell reference (e.g. "A1")
     * @param values Array of values to write
     * @throws Error if file not opened
     */
    Column: (sheet: string, startCell: string, values: any[]) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(
        `excel.write.Column`,
        this.handle,
        sheet,
        startCell,
        values
      );
    },

    /**
     * Writes a two-dimensional array of values starting at the specified cell
     * @param sheet Sheet name
     * @param startCell Starting cell reference (e.g. "A1")
     * @param values Two-dimensional array of values to write
     * @throws Error if file not opened
     */
    All: (sheet: string, startCell: string, values: any[][]) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.write.All`, this.handle, sheet, startCell, values);
    },
  };

  // Setting properties
  set = {
    /**
     * Applies a style to a cell
     * @param sheet Sheet name
     * @param cell Cell reference (e.g. "A1")
     * @param styleID Style ID to apply
     * @throws Error if file not opened
     */
    Style: (sheet: string, cell: string, styleID: number) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.set.Style`, this.handle, sheet, cell, styleID);
    },

    /**
     * Sets a row's height
     * @param sheet Sheet name
     * @param row Row number
     * @param height Height in points
     * @throws Error if file not opened
     */
    RowHeight: (sheet: string, row: number, height: number) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.set.RowHeight`, this.handle, sheet, row, height);
    },

    /**
     * Sets column width for a range of columns
     * @param sheet Sheet name
     * @param startCol Starting column letter
     * @param endCol Ending column letter
     * @param width Width in points
     * @throws Error if file not opened
     */
    ColumnWidth: (
      sheet: string,
      startCol: string,
      endCol: string,
      width: number
    ) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(
        `excel.set.ColumnWidth`,
        this.handle,
        sheet,
        startCol,
        endCol,
        width
      );
    },

    /**
     * Merges cells in a range
     * @param sheet Sheet name
     * @param startCell Starting cell reference (e.g. "A1")
     * @param endCell Ending cell reference (e.g. "B2")
     * @throws Error if file not opened
     */
    MergeCell: (sheet: string, startCell: string, endCell: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(
        `excel.set.MergeCell`,
        this.handle,
        sheet,
        startCell,
        endCell
      );
    },

    /**
     * Unmerges previously merged cells
     * @param sheet Sheet name
     * @param startCell Starting cell reference (e.g. "A1")
     * @param endCell Ending cell reference (e.g. "B2")
     * @throws Error if file not opened
     */
    UnmergeCell: (sheet: string, startCell: string, endCell: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(
        `excel.set.UnmergeCell`,
        this.handle,
        sheet,
        startCell,
        endCell
      );
    },

    /**
     * Sets a formula in a cell
     * @param sheet Sheet name
     * @param cell Cell reference (e.g. "C1")
     * @param formula Excel formula without the leading equals sign
     * @throws Error if file not opened
     */
    Formula: (sheet: string, cell: string, formula: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.set.Formula`, this.handle, sheet, cell, formula);
    },

    /**
     * Adds a hyperlink to a cell
     * @param sheet Sheet name
     * @param cell Cell reference (e.g. "A1")
     * @param url URL for the hyperlink
     * @param text Display text for the hyperlink
     * @throws Error if file not opened
     */
    Link: (sheet: string, cell: string, url: string, text: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.set.Link`, this.handle, sheet, cell, url, text);
    },
  };

  // Iteration methods
  each = {
    /**
     * Opens a row iterator
     * @param sheet Sheet name
     * @returns Row iterator ID
     * @throws Error if file not opened
     */
    OpenRow: (sheet: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.each.OpenRow`, this.handle, sheet);
    },

    /**
     * Gets the next row from the iterator
     * @param rowID Row iterator ID from excel.each.OpenRow
     * @returns Array of cell values or null if no more rows
     */
    NextRow: (rowID: string) => {
      return Process(`excel.each.NextRow`, rowID);
    },

    /**
     * Closes the row iterator
     * @param rowID Row iterator ID from excel.each.OpenRow
     */
    CloseRow: (rowID: string) => {
      return Process(`excel.each.CloseRow`, rowID);
    },

    /**
     * Opens a column iterator
     * @param sheet Sheet name
     * @returns Column iterator ID
     * @throws Error if file not opened
     */
    OpenColumn: (sheet: string) => {
      if (!this.handle) throw new Error("Excel file not opened");
      return Process(`excel.each.OpenColumn`, this.handle, sheet);
    },

    /**
     * Gets the next column from the iterator
     * @param colID Column iterator ID from excel.each.OpenColumn
     * @returns Array of cell values or null if no more columns
     */
    NextColumn: (colID: string) => {
      return Process(`excel.each.NextColumn`, colID);
    },

    /**
     * Closes the column iterator
     * @param colID Column iterator ID from excel.each.OpenColumn
     */
    CloseColumn: (colID: string) => {
      return Process(`excel.each.CloseColumn`, colID);
    },
  };

  // Conversion utilities
  convert = {
    /**
     * Converts a column name to a column number
     * @param colName Column name (e.g. "A", "AB")
     * @returns Column number (1-based)
     */
    ColumnNameToNumber: (colName: string) => {
      return Process(`excel.convert.ColumnNameToNumber`, colName);
    },

    /**
     * Converts a column number to a column name
     * @param colNum Column number (1-based)
     * @returns Column name
     */
    ColumnNumberToName: (colNum: number) => {
      return Process(`excel.convert.ColumnNumberToName`, colNum);
    },

    /**
     * Converts a cell reference to coordinates
     * @param cell Cell reference (e.g. "A1")
     * @returns Array with [columnNumber, rowNumber] (1-based)
     */
    CellNameToCoordinates: (cell: string) => {
      return Process(`excel.convert.CellNameToCoordinates`, cell);
    },

    /**
     * Converts coordinates to a cell reference
     * @param col Column number (1-based)
     * @param row Row number (1-based)
     * @returns Cell reference
     */
    CoordinatesToCellName: (col: number, row: number) => {
      return Process(`excel.convert.CoordinatesToCellName`, col, row);
    },
  };
}
