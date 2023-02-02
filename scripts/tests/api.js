function hello(name) {
  return "hello:" + name;
}

// Process Guard
function Auth(path, params, query, payload, headers) {
  if (params["name"] != "hi") {
    throw new Exception("failure param", 400);
  }

  if (payload.response == "success") {
    if (query.sid) {
      var id = Process("session.Get", "id");
      if (id != 1) {
        throw new Exception("failure sid", 403);
      }
    }
    return;
  }
  throw new Exception("failure", 403);
}

// IsRoot
function IsRoot() {
  return __YAO_SU_ROOT;
}
