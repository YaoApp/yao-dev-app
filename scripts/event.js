/**
 * Debug
 * @param {*} query
 */
function OnChange(query) {
  query = query || {};
  field = query.field; // 字段名称
  newVal = query.value; // 新数值
  oldVal = query.old; // 原始值
  extra = query.extra; // 开发者定义数据

  let data = { cost: 1000, query: query }; // 更新消费金额数据, 消费金额
  let setting = Process("yao.form.Setting", "pet", data); // 根据新数值生成配置信息;

  // 错误检测
  if (setting && setting.code && setting.message) {
    throw new Exception(setting.message, 500);
  }

  return {
    data: data, // 更新消费金额数据, 消费金额
    setting: setting,
  };
}

/**
 * Debug
 * @param {*} query
 */
function OnChangeList(query) {
  query = query || {};
  field = query.field; // 字段名称
  newVal = query.value; // 新数值
  oldVal = query.old; // 原始值
  extra = query.extra; // 开发者定义数据

  let data = { stock: 1000, query: query }; // 更新消费金额数据, 消费金额
  let setting = Process("yao.form.Setting", "pet", data); // 根据新数值生成配置信息;

  // 错误检测
  if (setting && setting.code && setting.message) {
    throw new Exception(setting.message, 500);
  }

  return {
    data: data, // 更新消费金额数据, 消费金额
    setting: setting,
  };
}
