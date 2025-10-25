import { Expr } from "./expr";

/**
 * Test Expression Parser
 * @test yao run scripts.lib.expr_test.TestExpr
 */
function TestExpr() {
  // Test data
  const testData = [
    {
      style_name: "style_1",
      color: "red",
      size: { width: 100, height: 200 },
      total_quantity: 150,
      total_stock: 200,
      sales_count: 50,
    },
    {
      style_name: "style_2",
      color: "blue",
      size: { width: 150, height: 250 },
      total_quantity: 280,
      total_stock: 350,
      sales_count: 70,
    },
    {
      style_name: "style_3",
      color: "green",
      size: { width: 200, height: 300 },
      total_quantity: 320,
      total_stock: 400,
      sales_count: 80,
    },
  ];

  const expr = new Expr(testData);
  const results: Array<{
    name: string;
    passed: boolean;
    error?: string;
    actual?: any;
    expected?: any;
  }> = [];

  function addTestResult(name: string, actual: any, expected: any) {
    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    results.push({
      name,
      passed,
      actual: passed ? undefined : actual,
      expected: passed ? undefined : expected,
    });
  }

  // Test array mapping expressions
  function testArrayMapping() {
    // Test simple field mapping
    const result1 = expr.Exec("{{ $data[n].style_name }}");
    const expected1 = ["style_1", "style_2", "style_3"];
    addTestResult("Array mapping - simple field", result1, expected1);

    // Test nested field mapping
    const result2 = expr.Exec("{{ $data[n].size.width }}");
    const expected2 = [100, 150, 200];
    addTestResult("Array mapping - nested field", result2, expected2);
  }

  // Test single value expressions
  function testSingleValue() {
    // Test dot notation
    const result1 = expr.Exec("{{ $data[0].color }}");
    addTestResult("Single value - dot notation", result1, "red");

    // Test bracket notation
    const result2 = expr.Exec('{{ $data[1]["color"] }}');
    addTestResult("Single value - bracket notation", result2, "blue");

    // Test nested value
    const result3 = expr.Exec("{{ $data[0].size.height }}");
    addTestResult("Single value - nested value", result3, 200);
  }

  // Test object mapping expressions
  function testObjectMapping() {
    const result = expr.Exec(
      "{{ name:$data[n].style_name, color:$data[n].color }}"
    );
    const expected = [
      { name: "style_1", color: "red" },
      { name: "style_2", color: "blue" },
      { name: "style_3", color: "green" },
    ];
    addTestResult("Object mapping - multiple fields", result, expected);
  }

  // Test complex object expressions
  function testComplexObject() {
    const result = expr.Exec({
      allStyles: "{{ $data[n].style_name }}",
      firstColor: "{{ $data[0].color }}",
      dimensions: {
        widths: "{{ $data[n].size.width }}",
        firstHeight: "{{ $data[0].size.height }}",
      },
    });

    const expected = {
      allStyles: ["style_1", "style_2", "style_3"],
      firstColor: "red",
      dimensions: {
        widths: [100, 150, 200],
        firstHeight: 200,
      },
    };

    addTestResult("Complex object expressions", result, expected);
  }

  // Test error handling
  function testErrorHandling() {
    // Test invalid expression
    const result1 = expr.Exec("{{ invalid.expression }}");
    addTestResult(
      "Error handling - invalid expression",
      result1,
      "{{ invalid.expression }}"
    );

    // Test missing fields
    const result2 = expr.Exec("{{ $data[n].nonexistent }}");
    addTestResult("Error handling - missing fields", result2, [
      undefined,
      undefined,
      undefined,
    ]);

    // Test invalid array index
    const result3 = expr.Exec("{{ $data[999].style_name }}");
    addTestResult(
      "Error handling - invalid array index",
      result3,
      "{{ $data[999].style_name }}"
    );
  }

  // Test whitespace handling
  function testWhitespace() {
    const results1 = [
      expr.Exec("{{$data[0].color}}"),
      expr.Exec("{{ $data[0].color }}"),
      expr.Exec("{{    $data[0].color    }}"),
      expr.Exec(`{{
        $data[0].color
      }}`),
    ];

    addTestResult(
      "Whitespace handling",
      results1.every((r) => r === "red"),
      true
    );
  }

  // Test array sugar syntax
  function testArraySugar() {
    // Test single expression in array
    const result1 = expr.Exec(["{{ $data[n].total_quantity }}"]);
    const expected1 = [150, 280, 320];
    addTestResult("Array sugar - single expression", result1, expected1);

    // Test array sugar in object
    const result2 = expr.Exec({
      series: [
        {
          data: ["{{ $data[n].total_quantity }}"],
          type: "bar",
        },
      ],
    });
    const expected2 = {
      series: [
        {
          data: [150, 280, 320],
          type: "bar",
        },
      ],
    };
    addTestResult("Array sugar - in object", result2, expected2);

    // Test mixed array content
    const result3 = expr.Exec([
      "{{ $data[0].total_quantity }}",
      ["{{ $data[n].total_quantity }}"],
      { value: ["{{ $data[n].total_quantity }}"] },
    ]);
    const expected3 = [150, [150, 280, 320], { value: [150, 280, 320] }];
    addTestResult("Array sugar - mixed content", result3, expected3);
  }

  // Test chart configuration scenarios
  function testChartConfig() {
    // Test direct property expression
    const result1 = expr.Exec({
      data: "{{ $data[n].total_quantity }}",
    });
    const expected1 = {
      data: [150, 280, 320],
    };
    addTestResult("Chart config - direct property", result1, expected1);

    // Test array property expression
    const result2 = expr.Exec({
      data: ["{{ $data[n].total_quantity }}"],
    });
    const expected2 = {
      data: [150, 280, 320],
    };
    addTestResult("Chart config - array property", result2, expected2);

    // Test nested chart configuration
    const result3 = expr.Exec({
      series: [
        {
          data: ["{{ $data[n].total_quantity }}"],
          type: "bar",
        },
      ],
      yAxis: {
        data: ["{{ $data[n].style_name }}"],
        type: "category",
      },
    });
    const expected3 = {
      series: [
        {
          data: [150, 280, 320],
          type: "bar",
        },
      ],
      yAxis: {
        data: ["style_1", "style_2", "style_3"],
        type: "category",
      },
    };
    addTestResult("Chart config - nested structure", result3, expected3);

    // Test multiple series
    const result4 = expr.Exec({
      series: [
        {
          data: "{{ $data[n].total_stock }}",
          name: "库存量",
        },
        {
          data: "{{ $data[n].sales_count }}",
          name: "销量",
        },
      ],
    });
    const expected4 = {
      series: [
        {
          data: [200, 350, 400],
          name: "库存量",
        },
        {
          data: [50, 70, 80],
          name: "销量",
        },
      ],
    };
    addTestResult("Chart config - multiple series", result4, expected4);
  }

  // Run all tests
  testArrayMapping();
  testSingleValue();
  testObjectMapping();
  testComplexObject();
  testErrorHandling();
  testWhitespace();
  testArraySugar();
  testChartConfig();

  // Print test results
  console.log("\nTest Results:");
  results.forEach((result) => {
    if (result.passed) {
      console.log(`✓ ${result.name}`);
    } else {
      console.error(`✗ ${result.name}`);
      console.error("  Expected:", JSON.stringify(result.expected, null, 2));
      console.error("  Actual:", JSON.stringify(result.actual, null, 2));
    }
  });

  // Return overall test result
  const failedTests = results.filter((r) => !r.passed);
  if (failedTests.length > 0) {
    console.error("\nFailed Tests:");
    failedTests.forEach((test) => {
      console.error(`\n✗ ${test.name}`);
      console.error("  Expected:", JSON.stringify(test.expected, null, 2));
      console.error("  Actual:", JSON.stringify(test.actual, null, 2));
    });
    throw new Error(`${failedTests.length} tests failed`);
  }

  return "All tests passed";
}
