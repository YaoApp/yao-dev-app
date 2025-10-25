import { Model } from "./model";

// yao run scripts.lib.model_test.TestList
function TestList() {
  const models = Model.List();
  console.log(models);
}

// yao run scripts.lib.model_test.TestGet
function TestGet() {
  const model = Model.Get("tests.pet");
  console.log(model);
  return model;
}
