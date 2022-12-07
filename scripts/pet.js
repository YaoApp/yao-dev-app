/**
 * before:search Hook
 * @param {*} query
 * @param {*} page
 * @param {*} pagesize
 * @returns []
 */
function BeforeSearch(query, page, pagesize) {
  query = query || {};
  query.wheres = query.wheres || [];
  pagesize = 1;

  let user_id = Process("session.Get", "user_id");
  let value = query.wheres[0] ? query.wheres[0].value : "";
  console.log(`[BeforeSearch] query.wheres[0].value = ${value}`);
  console.log(`[BeforeSearch] session.Get user_id = ${user_id}`);

  return [query, page, pagesize];
}

/**
 * Search process
 * @param {*} query
 * @param {*} page
 * @param {*} pagesize
 * @returns
 */
function Search(query, page, pagesize) {
  query = query || {};
  query.wheres = query.wheres || [];
  let user_id = Process("session.Get", "user_id");
  let value = query.wheres[0] ? query.wheres[0].value : "";
  console.log(`[Search] query.wheres[0].value = ${value}`);
  console.log(`[Search] session.Get user_id = ${user_id}`);
  return Process("models.pet.Paginate", query, page, pagesize);
}

/**
 * After hook
 * @param {*} resp
 * @returns
 */
function AfterSearch(resp) {
  resp["after:hook"] = "AfterSearch";
  let user_id = Process("session.Get", "user_id");
  console.log(`[AfterSearch] session.Get user_id = ${user_id}`);
  return resp;
}

/**
 * Before Find process
 * @param {*} id
 * @param {*} query
 */
function BeforeFind(id, query) {
  query = query || {};
  let user_id = Process("session.Get", "user_id");
  console.log(`[BeforeFind] session.Get user_id = ${user_id}`);
  return [id, query];
}

/**
 * Find process
 * @param {*} id
 * @param {*} query
 */
function Find(id, query) {
  query = query || {};
  let user_id = Process("session.Get", "user_id");
  console.log(`[Find] session.Get user_id = ${user_id}`);
  return Process("models.pet.Find", id, query);
}

/**
 * After Find hook
 * @param {*} resp
 * @returns
 */
function AfterFind(resp) {
  resp["after:hook"] = "AfterFind";
  let user_id = Process("session.Get", "user_id");
  console.log(`[AfterFind] session.Get user_id = ${user_id}`);
  return resp;
}

/**
 * Custom guard
 * @param {*} path
 * @param {*} params
 * @param {*} query
 * @param {*} payload
 * @param {*} headers
 */
function Guard(path, params, query, payload, headers) {
  isTest = headers["Unit-Test"] ? headers["Unit-Test"] : [];
  if (isTest[0] == "yes") {
    throw new Exception("Unit-test throw", 418);
  }
}

/**
 * Custom List view compute array
 */
function CategoryList(value, ...args) {
  value = value || [];
  let categories = [];

  value.forEach((item) => {
    item = item || {};
    row = item.category || {};
    categories.push(row);
  });
  return categories;
}

/**
 * Custom List view compute array tree
 * @param {*} value
 * @param  {...any} args
 * @returns
 */
function CategoryListTree(value, ...args) {
  let categories = CategoryList(value);
  let treelist = Process("utils.arr.Tree", categories, {
    primary: "id", // primary field
    parent: "parent", // parent field
    children: "children", // children field
  });
  return treelist;
}

/**
 * Custom List edit compute
 * @param {*} value
 * @param  {...any} args
 * @returns
 */
function CategorySave(id, data) {
  // flatten tree -> array
  let categories = Process("utils.tree.Flatten", data, {
    parent: "parent", // primary field
    primary: "id", // parent field
    children: "children", // children field
  });

  // Save to db
  console.log(id, categories);
}
