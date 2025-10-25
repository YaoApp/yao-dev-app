import { Process } from "@yao/runtime";
import { Volcengine, Request } from "./volcengine";

/**
 * @test yao run scripts.lib.volcengine_test.TestVolcenginePost
 */
function TestVolcenginePost() {
  const id = Process("utils.env.Get", "VOLCENGINE_ACCESS_KEY_ID");
  const secret = Process("utils.env.Get", "VOLCENGINE_SECRET_ACCESS_KEY");

  const volcengine = new Volcengine({
    AccessKeyId: id,
    SecretAccessKey: secret,
    Service: "cv",
    Region: "cn-north-1",
    Endpoint: "visual.volcengineapi.com",
  });

  const prompt = "A beautiful girl 2";
  const size = { width: 256, height: 256 };
  const resp = volcengine.Post(
    { Action: "CVProcess", Version: "2022-08-31" },
    { req_key: "high_aes_general_v21_L", prompt: prompt, ...size }
  );

  return resp;
}

function TestVolcengineGet() {
  const id = Process("utils.env.Get", "VOLCENGINE_ACCESS_KEY_ID");
  const secret = Process("utils.env.Get", "VOLCENGINE_SECRET_ACCESS_KEY");

  const volcengine = new Volcengine({
    AccessKeyId: id,
    SecretAccessKey: secret,
    Service: "ecs",
    Region: "cn-beijing",
    Endpoint: "open.volcengineapi.com",
  });

  const resp = volcengine.Get({
    Action: "DescribeZones",
    Version: "2020-04-01",
  });

  return resp;
}

/**
 * @test yao run scripts.lib.volcengine_test.TestVolcengineSign
 */
function TestVolcengineSign() {
  const volcengine = new Volcengine({
    AccessKeyId: "testAccessKeyId",
    SecretAccessKey: "testSecretKey",
    Endpoint: "open.volcengineapi.com",
    Region: "cn-beijing",
    Service: "ecs",
  });
  const xDate = "20250504T080000Z";

  // Test case 1: GET request with query parameters (matching the example format)
  const getRequest: Request = {
    Method: "GET",
    URI: "/",
    Headers: {
      host: "open.volcengineapi.com",
      "x-date": xDate,
    },
    Query: {
      Action: "DescribeInvocations",
      Version: "2020-04-01",
      PageNumber: "2",
    },
    Payload: null,
  };

  console.log("=== Test Case 1: GET Request ===");
  console.log("Request:", JSON.stringify(getRequest, null, 2));
  const auth1 = volcengine.getAuthorization(getRequest);
  console.log("Authorization:", auth1);
  console.log("\n");

  // Test case 2: POST request with JSON payload
  const postRequest: Request = {
    Method: "POST",
    URI: "/",
    Headers: {
      host: "open.volcengineapi.com",
      "x-date": xDate,
      "content-type": "application/json",
    },
    Query: {
      Action: "CreateInstance",
      Version: "2020-04-01",
    },
    Payload: {
      name: "test-instance",
      type: "ecs.g1.large",
    },
  };

  console.log("=== Test Case 2: POST Request with JSON Payload ===");
  console.log("Request:", JSON.stringify(postRequest, null, 2));
  const auth2 = volcengine.getAuthorization(postRequest);
  console.log("Authorization:", auth2);
  console.log("\n");

  // Test case 3: POST request with array payload
  const batchRequest: Request = {
    Method: "POST",
    URI: "/api/v1/batch",
    Headers: {
      host: "open.volcengineapi.com",
      "content-type": "application/json",
    },
    Query: {
      action: "BatchProcess",
    },
    Payload: [
      { id: 1, operation: "resize", width: 100, height: 100 },
      { id: 2, operation: "crop", x: 0, y: 0, width: 50, height: 50 },
    ],
  };

  console.log("=== Test Case 3: POST Request with Array Payload ===");
  console.log("Request:", JSON.stringify(batchRequest, null, 2));
  console.log("Authorization:", volcengine.getAuthorization(batchRequest));
  console.log("\n");

  // Test case 4: GET request with multiple headers and query parameters
  const complexRequest: Request = {
    Method: "GET",
    URI: "/api/v2/complex",
    Headers: [
      { host: "open.volcengineapi.com" },
      { "content-type": "application/json" },
      { "x-custom-header": "custom-value" },
      { "x-date": new Date().toISOString() },
    ],
    Query: [
      { version: "2020-01-01" },
      { action: "ComplexOperation" },
      { filter: "status=active" },
      { sort: "created_at:desc" },
    ],
    Payload: null,
  };

  console.log("=== Test Case 4: Complex GET Request ===");
  console.log("Request:", JSON.stringify(complexRequest, null, 2));
  console.log("Authorization:", volcengine.getAuthorization(complexRequest));
}
