/**
 * User Login
 * @param {*} payload
 */
function Login(payload) {
  log.Trace("[user] Login %s", payload.email);
  return Process("yao.admin.Login", payload);
}
