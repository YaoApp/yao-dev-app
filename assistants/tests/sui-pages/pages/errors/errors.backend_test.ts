export function TestAlwaysFail(t: TestingT, ctx: SUIContext) {
  t.assert.Equal(1, 2, "intentional failure for coverage");
}

export function TestAlwaysSkip(t: TestingT, ctx: SUIContext) {
  t.skip("skipped for coverage");
}

export function TestSetAuthorizedAndReset(t: TestingT, ctx: SUIContext) {
  ctx.setAuthorized({ user_id: "test-user", role: "admin" });
  const result = ctx.call("GetStatus");
  t.assert.NotNil(result);

  ctx.reset();
  const result2 = ctx.call("GetStatus");
  t.assert.NotNil(result2);
}

export function TestCallWithRequestRender(t: TestingT, ctx: SUIContext) {
  const data = ctx.callWithRequest("GetRenderData", { key: "value" });
  t.assert.NotNil(data);
  t.assert.True(data.rendered);
}

export function TestCallNonExistentMethod(t: TestingT, ctx: SUIContext) {
  t.assert.Panic(() => {
    ctx.call("NonExistentMethod123");
  }, "Should throw for missing method");
}

export function TestRuntimeError(t: TestingT, ctx: SUIContext) {
  throw new Error("deliberate execution error for coverage");
}
