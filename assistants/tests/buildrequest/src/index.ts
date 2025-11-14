// @ts-nocheck
import { Process } from "@yao/runtime";

/**
 * Test Create Hook for BuildLLMRequest
 * 
 * Test scenarios:
 * - "no_override": returns empty object, should use ast and ctx values
 * - "override_temperature": overrides only temperature
 * - "override_all": overrides all available fields
 * - "override_route_metadata": overrides route and metadata
 */
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  const content = messages[0]?.content || "";

  switch (content) {
    case "no_override":
      return scenarioNoOverride();
    
    case "override_temperature":
      return scenarioOverrideTemperature();
    
    case "override_all":
      return scenarioOverrideAll();
    
    case "override_route_metadata":
      return scenarioOverrideRouteMetadata();
    
    default:
      return scenarioDefault(content);
  }
}

/**
 * Scenario: No override from hook
 * Should use ast.Options and ctx values
 */
function scenarioNoOverride(): agent.Create {
  return {
    messages: [
      { role: "system", content: "Testing with no overrides" }
    ]
  };
}

/**
 * Scenario: Override only temperature
 * Hook temperature should take priority over ast.Options
 */
function scenarioOverrideTemperature(): agent.Create {
  return {
    messages: [
      { role: "system", content: "Testing temperature override" }
    ],
    temperature: 0.9  // Should override ast.Options temperature (0.5)
  };
}

/**
 * Scenario: Override all available fields
 * All hook values should take priority
 */
function scenarioOverrideAll(): agent.Create {
  const temperature = 0.8;
  const maxTokens = 2000;
  const maxCompletionTokens = 1800;

  return {
    messages: [
      { role: "system", content: "Testing full override" }
    ],
    audio: { voice: "alloy", format: "mp3" },
    temperature: temperature,
    max_tokens: maxTokens,
    max_completion_tokens: maxCompletionTokens,
    route: "/hook/route",
    metadata: {
      source: "hook",
      override: true
    }
  };
}

/**
 * Scenario: Override route and metadata
 * Tests CUI context override priority
 */
function scenarioOverrideRouteMetadata(): agent.Create {
  return {
    messages: [
      { role: "system", content: "Testing route and metadata override" }
    ],
    route: "/custom/route",
    metadata: {
      custom: true,
      hook_data: "test"
    }
  };
}

/**
 * Default scenario
 */
function scenarioDefault(content: string): agent.Create {
  return {
    messages: [
      { role: "user", content: content }
    ]
  };
}

