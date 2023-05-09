/**
 * Draw picture
 * @param {} input
 * @returns
 */
function Draw(payload) {
  payload = payload || {};
  payload.width = parseInt(payload.width);
  payload.height = parseInt(payload.height);
  return payload;
}

/**
 * Draw picture
 * @param {*} payload
 * @returns
 */
function DrawAsync(payload) {
  payload = payload || {};
  payload.width = parseInt(payload.width) || 512;
  payload.height = parseInt(payload.height) || 512;
  payload.width = payload.width > 512 ? 512 : payload.width;
  payload.height = payload.height > 512 ? 512 : payload.height;

  payload.steps = 5;
  payload.prompt = "maltese puppy";
  PostAsync("/api/v1/sdapi/v1/txt2img", payload, (progress) => {
    console.log(progress);
  });

  return payload;
}

function PostAsync(api, payload, cb) {
  let cfg = setting();
  let headers = { Authorization: `Basic ${btoa(cfg.user + ":" + cfg.pass)}` };

  let url = `${cfg.host}${api}`;
  let completed = false;

  // post async
  Async(
    () => http.Post(url, payload, null, null, headers),
    (response) => {
      completed = true;
      if (response.code != 200) {
        let data = response.data || {};
        let err = data.error || {};
        let message = err.message || "unknown error";
        log.Error(`SD API error ${message}`);
        throw new Exception(`SD API error ${message}`, response.code || 500);
      }
    }
  );

  // check progress
  url = `${cfg.host}/api/v1/sd/progress`;
  while (completed) {
    let response = http.Get(url, null, null, null, headers);
    if (response.code != 200) {
      let data = response.data || {};
      let err = data.error || {};
      let message = err.message || "unknown error";
      log.Error(`SD API error ${message}`);
      throw new Exception(`SD API error ${message}`, response.code || 500);
    }

    let data = response.data || {};
    let progress = data.progress || 0;
    log.Info(`SD API progress ${progress}`);
    if (progress == 100) {
      break;
    }

    cb(progress);
    time.Sleep(1000);
  }
}

/**
 * Get stable-diffusion settings
 * @returns {Map}
 */
function setting() {
  let vars = Process("utils.env.GetMany", "SD_HOST", "SD_USER", "SD_PASS");
  return {
    user: vars["SD_USER"],
    pass: vars["SD_PASS"],
    host: vars["SD_HOST"] ? vars["SD_HOST"] : "http://127.0.0.1:7861",
  };
}
