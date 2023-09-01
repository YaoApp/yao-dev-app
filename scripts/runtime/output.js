function UndefineTest(value) {
  const fun = () => {};
  const promise = new Promise(() => {});
  console.log(`value == null : ${value == null}`);
  console.log(`value === null : ${value === null}`);
  console.log(`value === undefined : ${value === undefined}`);
  console.log(`value == 0 : ${value == 0}`);
  console.log(fun);
  console.log(promise);
  console.log(value);
  return value;
}
