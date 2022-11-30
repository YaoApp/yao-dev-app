/**
 * before:search Hook
 * @param {*} query
 * @param {*} page
 * @param {*} pagesize
 * @returns []
 */
function BeforeSearch(query, page, pagesize) {
  query = query || {};
  pagesize = 1;

  let user_id = Process("session.Get", "user_id");
  console.log(
    `[BeforeSearch] query.wheres[0].value = ${query.wheres[0].value}`
  );
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
  let user_id = Process("session.Get", "user_id");
  console.log(`[Search] query.wheres[0].value = ${query.wheres[0].value}`);
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
