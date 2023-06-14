/**
 * Dyform Loader: load
 * @param {*} id
 * @param {*} source
 * @returns
 */
function Load(id, source) {
  let dsl = source || {};
  dsl["id"] = id;
  return dsl;
}

/**
 * Dyform Loader: reload
 * @param {*} id
 * @param {*} source
 * @param {*} dsl
 * @returns
 */
function Reload(id, source, dsl) {
  let newDSL = source || {};
  newDSL["id"] = id;
  newDSL["tests.reload"] = typeof dsl === "object";
  return newDSL;
}

/**
 * Dyform Loader: unload
 * @param {*} id
 */
function Unload(id) {
  if (id == undefined || id == null) {
    throw new Exception("id is required");
  }
}

// ** Dyform Process ***
// ========================================

/**
 * @process widgets.dyform.Setting
 * @args [id, dsl]
 */
function Setting(id, dsl) {
  dsl = dsl || {};
  dsl["tests.id"] = id;
  return dsl;
}
