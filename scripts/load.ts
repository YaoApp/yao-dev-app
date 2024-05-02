/**
 * After loading the application, you can do some initialization operations (optional)
 * @see app.yao afterLoad
 */
function After(reload: Boolean) {
  if (reload) {
    // do some initialization operations when reloading
    console.log(`do some initialization Reload = ${reload}`);

    // if something goes wrong, you can throw an exception
    // throw new Exception("After Load Exception", 400);

    return;
  }
  // do some initialization operations when loading
  console.log(`do some initialization Reload = ${reload}`);

  // if something goes wrong, you can throw an exception
  // throw new Exception("After Load Exception", 400);
}
