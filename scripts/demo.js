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
    ["name", "stock", "status", "rank"],
    [
      ["机器人", 100, "启用", 1],
      ["运输车", 80, "启用", 2],
      ["货柜", 100, "停用", 3],
    ]
  );
}
