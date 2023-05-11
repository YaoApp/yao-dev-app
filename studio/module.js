/**
 * Template module
 */
const Template = {
  data: {
    name: "Pet",
    table: { name: "pet" },
    columns: [
      { label: "ID", name: "id", type: "ID" },
      {
        label: "Name",
        name: "name",
        type: "string",
        length: 256,
        index: true,
        nullable: true,
        Searchable: true,
        Component: {
          table: { view: "Text", edit: "Input" },
          form: { view: "Text", edit: "Input" },
        },
      },
    ],
  },
  explain: `
    - The above content is the JSON template.
    - The JSON template is used to generate the module.
    - The field "name" is a module name.
    - The field "table" is a table, the table "name" is used to generate the table in database.
    - The field "columns" is a array, each element is a column of table.
    - The field "label" is a column label, the label is used to display in table and form.
    - The field "name" is a column name, the name is used to generate the column in database.
    - The field "type" is a column type, the type is used to generate the column in database. Should be one of "string", "text", "integer", "date", "datetime", "ID".
    - The field "length" is a column length, the length is used to generate the column in database.
    - The field "index" is a column index, the index is used to generate the column in database.
    - The field "nullable" is a column nullable, the nullable is used to generate the column in database.
    - The field "Searchable" is a column Searchable, the Searchable is used to generate the column in database.
    - The field "Component" is a column Component, the Component is used to generate the column in database.
    - The field "form" is description of the Form interface display.
    - The field "table" is description of the Table interface display.
    - The field "view" is a column view, the view is used to generate the column in database. Should be one of "Text", "Tag"
    - The field "edit" is a column edit, the edit is used to generate the column in database. should be one of "Input", "Select", "Datetime".
  `,
};

/**
 * Command neo.module.create
 * Prepare Hook: Before
 * @param {*} context
 * @param {*} messages
 */
function CreateBefore(context, messages) {
  return { template: Template.data, explain: Template.explain };
}

/**
 * Command neo.module.create
 * Prepare Hook: After
 * @param {*} content
 */
function CreateAfter(content) {
  // console.log("DataAfter:", content);
  const response = JSON.parse(content);
  const columns = response.columns || [];
  console.log(columns);

  if (columns.length > 0) {
    // Print data preview
    ssWrite(`\n`);
    ssWrite(`| label | name | type | Searchable | Table | Form |\n`);
    ssWrite(`| ----- | ---- | ---- | ---------- | ----- | ---- |\n`);
    columns.forEach((item) => {
      console.log(item);
      component = item.Component || {};
      table = component.table || {};
      form = component.form || {};
      message = `| ${item.label} |  ${item.name} |  ${item.type} | ${
        item.Searchable || ""
      } | ${table.view || ""} ${table.edit || ""} | ${form.edit || ""} |\n`;
      ssWrite(message);
    });
    ssWrite(`  \n\n`);
    return { data: response };
  }

  console.log(content);
  throw new Exception("Error: data is empty.", 500);
}

/**
 * Run the command
 * @param {*} payload
 */
function Create(payload) {
  console.log(payload);
  return { path: "/x/Table/pet", name: "pet" };
}
