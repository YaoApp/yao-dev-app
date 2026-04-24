export function TestGetDashboard(t: TestingT, ctx: SUIContext) {
  const result = ctx.call("GetDashboard", "active");
  t.assert.NotNil(result);
  t.assert.Equal(result.title, "Test Dashboard");
  t.assert.Equal(result.status, "active");
  t.assert.Len(result.items, 3);
}

export function TestCreateItem(t: TestingT, ctx: SUIContext) {
  const result = ctx.call("CreateItem", { name: "test-item" });
  t.assert.NotNil(result);
  t.assert.True(result.created);
  t.assert.Equal(result.name, "test-item");
}

export function TestCreateItemValidation(t: TestingT, ctx: SUIContext) {
  t.assert.Panic(() => {
    ctx.call("CreateItem", {});
  }, "Should throw when name is missing");
}

export function TestGetPageData(t: TestingT, ctx: SUIContext) {
  const data = ctx.callWithRequest("GetPageData", { page: 2 });
  t.assert.NotNil(data);
  t.assert.Equal(data.page, 2);
}
