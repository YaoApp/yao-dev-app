function Data() {
  Process(
    "yao.table.Insert",
    "pet",
    ["name", "type", "status", "mode", "stay", "cost", "doctor_id"],
    [
      ["Cookie", "cat", "checked", "enabled", 200, 105, 1],
      ["Baby", "dog", "checked", "enabled", 186, 24, 1],
      ["Poo", "others", "checked", "enabled", 199, 66, 1],
    ]
  );

  Process(
    "models.category.Insert",
    ["id", "name", "stock", "status", "rank", "parent"],
    [
      [1, "机器人", 100, "启用", 1, null],
      [2, "运输车", 80, "启用", 2, null],
      [3, "货柜", 100, "停用", 3, null],
      [4, "语音机器人", 100, "启用", 1, 1],
      [5, "货柜机器人", 100, "启用", 1, 1],
      [6, "小爱机器人", 100, "启用", 4, 4],
      [7, "小度机器人", 100, "启用", 4, 4],
    ]
  );

  Process(
    "models.pet.category.Insert",
    ["pid", "cid"],
    [
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [1, 6],
      [1, 7],
    ]
  );
}
