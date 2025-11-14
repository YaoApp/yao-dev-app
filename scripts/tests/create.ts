// Test script for nested Process calls
// This script is called from JavaScript hook and makes database calls

import { Process } from "@yao/runtime";

/**
 * Get roles from database
 * This will be called from assistant hook to test nested Process calls
 */
function GetRoles(): any {
  // Call model process to query database
  const roles = Process("models.__yao.role.Get", {});
  return roles;
}

/**
 * Get a specific role by ID
 */
function GetRole(id: number): any {
  const role = Process("models.__yao.role.Find", id, {});
  return role;
}

/**
 * Complex nested call - script calls another function which calls model
 * This tests deep nesting: hook -> script.NestedCall -> script.GetRoles -> model
 */
function NestedCall(): any {
  // Call GetRoles function (same script, different function)
  const roles = GetRoles();

  // Also call GetRole to test multiple nested calls
  const firstRole = roles && roles.length > 0 ? GetRole(roles[0].id) : null;

  return {
    message: "Deep nested call completed",
    roles_count: roles?.length || 0,
    first_role: firstRole,
  };
}
