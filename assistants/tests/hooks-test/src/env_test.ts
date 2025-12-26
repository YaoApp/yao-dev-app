/**
 * Before/After Hook Scripts for Agent Test Framework V2
 *
 * This file provides setup and teardown functions for JSONL test cases.
 * Functions are called via V8 directly from the test runner.
 *
 * Usage in JSONL:
 *   "before": "env_test.Before"
 *   "after": "env_test.After"
 *
 * CLI usage:
 *   --before env_test.BeforeAll
 *   --after env_test.AfterAll
 */

// Type definitions
interface TestCase {
  id: string;
  input: any;
  assert?: any;
  metadata?: Record<string, any>;
}

interface TestResult {
  id: string;
  status: "passed" | "failed" | "error" | "timeout" | "skipped";
  output?: any;
  error?: string;
  duration_ms: number;
}

interface BeforeResult {
  data?: Record<string, any>;
}

/**
 * Before - Called before each test case runs
 *
 * @param testCase - The test case about to run
 * @returns BeforeResult with data to pass to After
 */
function Before(testCase: TestCase): BeforeResult {
  console.log(`[env_test] Before called for test: ${testCase.id}`);

  const startTime = Date.now();

  // Prepare test data
  const testData = {
    test_id: testCase.id,
    start_time: startTime,
    prepared_by: "env_test.Before",
    mock_user_id: `user_${testCase.id}_${startTime}`,
    mock_session_id: `session_${Date.now()}`,
  };

  console.log(`[env_test] Before completed for test: ${testCase.id}`);

  return {
    data: testData,
  };
}

/**
 * After - Called after each test case completes (pass or fail)
 *
 * @param testCase - The test case that ran
 * @param result - The test result
 * @param beforeData - Data returned from Before
 */
function After(testCase: TestCase, result: TestResult, beforeData: any): void {
  console.log(
    `[env_test] After called for test: ${testCase.id}, status: ${result.status}`
  );

  // Cleanup mock data
  if (beforeData?.mock_user_id) {
    console.log(`[env_test] Cleaning up mock user: ${beforeData.mock_user_id}`);
  }

  if (beforeData?.mock_session_id) {
    console.log(
      `[env_test] Cleaning up mock session: ${beforeData.mock_session_id}`
    );
  }

  console.log(`[env_test] After completed for test: ${testCase.id}`);
}

/**
 * BeforeAll - Called once before all test cases
 *
 * @param testCases - All test cases to be run
 * @returns BeforeResult with global data
 */
function BeforeAll(testCases: TestCase[]): BeforeResult {
  console.log(`[env_test] BeforeAll called for ${testCases.length} test cases`);

  // Global initialization
  const globalData = {
    suite_id: `suite_${Date.now()}`,
    test_count: testCases.length,
    started_at: new Date().toISOString(),
    initialized_by: "env_test.BeforeAll",
  };

  console.log(
    `[env_test] Global setup completed, suite_id: ${globalData.suite_id}`
  );

  return {
    data: globalData,
  };
}

/**
 * AfterAll - Called once after all test cases complete
 *
 * @param results - All test results
 * @param beforeData - Data returned from BeforeAll
 */
function AfterAll(results: TestResult[], beforeData: any): void {
  console.log(`[env_test] AfterAll called for ${results.length} results`);

  // Calculate summary
  const summary = {
    total: results.length,
    passed: results.filter((r) => r.status === "passed").length,
    failed: results.filter((r) => r.status === "failed").length,
    errors: results.filter((r) => r.status === "error").length,
  };

  console.log(`[env_test] Test Summary: ${summary.passed}/${summary.total} passed`);

  // Global cleanup
  if (beforeData?.suite_id) {
    console.log(`[env_test] Cleaning up suite: ${beforeData.suite_id}`);
  }

  console.log(`[env_test] AfterAll completed`);
}

