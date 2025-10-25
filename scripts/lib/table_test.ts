import { Table } from "./table";

/*
 * Test get table id
 * @test yao run scripts.lib.table_test.TestGetTableID
 */
function TestGetTableID() {
  const table = Table.GetTableID("/x/table/product");
  const not_table = Table.GetTableID("/x/xx/notable/");
  return { table, not_table: not_table === undefined };
}

/**
 * Test get bind model
 * @test yao run scripts.lib.table_test.TestGetBindModel
 * @returns
 */
function TestGetBindModel() {
  const bind_model = Table.GetBindModel("/x/table/product");
  const table_not_exists = Table.GetBindModel("/x/table/notable`");
  const not_table = Table.GetBindModel("/x/xx/notable/");
  return {
    bind_model,
    table_not_exists: table_not_exists === undefined,
    not_table: not_table === undefined,
  };
}
