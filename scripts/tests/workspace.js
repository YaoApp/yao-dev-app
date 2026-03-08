// Workspace JSAPI black-box tests
// Usage: yao run scripts.tests.workspace.<testName>

function TestCreate() {
  var ws = workspace.Create({
    name: "test-project",
    owner: "test-user",
    node: "default",
    labels: { env: "test" },
  });
  if (!ws.id) throw new Error("expected ws.id");
  if (ws.name !== "test-project") throw new Error("name mismatch: " + ws.name);
  if (ws.node !== "default") throw new Error("node mismatch: " + ws.node);

  workspace.Delete(ws.id);
  return "PASS";
}

function TestGet() {
  var ws = workspace.Create({
    name: "get-test",
    owner: "user-1",
    node: "default",
  });
  var got = workspace.Get(ws.id);
  if (!got) throw new Error("Get returned null");
  if (got.id !== ws.id) throw new Error("id mismatch");

  var missing = workspace.Get("ws-nonexistent-id");
  if (missing !== null && missing !== undefined)
    throw new Error("expected null for missing workspace");

  workspace.Delete(ws.id);
  return "PASS";
}

function TestList() {
  var ws1 = workspace.Create({
    name: "list-a",
    owner: "user-list",
    node: "default",
  });
  var ws2 = workspace.Create({
    name: "list-b",
    owner: "user-list",
    node: "default",
  });

  var all = workspace.List({ owner: "user-list" });
  if (all.length < 2) throw new Error("expected at least 2, got " + all.length);

  workspace.Delete(ws1.id);
  workspace.Delete(ws2.id);
  return "PASS";
}

function TestReadWriteFile() {
  var ws = workspace.Create({
    name: "rw-test",
    owner: "user-1",
    node: "default",
  });
  ws.WriteFile("hello.txt", "Hello, World!");
  var content = ws.ReadFile("hello.txt");
  if (content !== "Hello, World!")
    throw new Error("content mismatch: " + content);

  workspace.Delete(ws.id);
  return "PASS";
}

function TestReadDir() {
  var ws = workspace.Create({
    name: "readdir-test",
    owner: "user-1",
    node: "default",
  });
  ws.WriteFile("a.txt", "aaa");
  ws.MkdirAll("sub/deep");
  ws.WriteFile("sub/b.txt", "bbb");
  ws.WriteFile("sub/deep/c.txt", "ccc");

  var entries = ws.ReadDir(".");
  if (entries.length < 2) throw new Error("expected >= 2 entries, got " + entries.length);

  var recursive = ws.ReadDir(".", true);
  if (recursive.length < 4) throw new Error("expected >= 4 recursive entries, got " + recursive.length);

  workspace.Delete(ws.id);
  return "PASS";
}

function TestStat() {
  var ws = workspace.Create({
    name: "stat-test",
    owner: "user-1",
    node: "default",
  });
  ws.WriteFile("file.txt", "12345");
  var info = ws.Stat("file.txt");
  if (info.is_dir) throw new Error("expected file, not dir");
  if (info.size !== 5) throw new Error("expected size 5, got " + info.size);

  ws.MkdirAll("mydir");
  var dirInfo = ws.Stat("mydir");
  if (!dirInfo.is_dir) throw new Error("expected dir");

  workspace.Delete(ws.id);
  return "PASS";
}

function TestExistsIsDirIsFile() {
  var ws = workspace.Create({
    name: "checks-test",
    owner: "user-1",
    node: "default",
  });
  ws.WriteFile("real.txt", "data");
  ws.MkdirAll("mydir");

  if (!ws.Exists("real.txt")) throw new Error("Exists failed for file");
  if (!ws.Exists("mydir")) throw new Error("Exists failed for dir");
  if (ws.Exists("nope.txt")) throw new Error("Exists should be false");

  if (!ws.IsFile("real.txt")) throw new Error("IsFile failed");
  if (ws.IsFile("mydir")) throw new Error("IsFile should be false for dir");

  if (!ws.IsDir("mydir")) throw new Error("IsDir failed");
  if (ws.IsDir("real.txt")) throw new Error("IsDir should be false for file");

  workspace.Delete(ws.id);
  return "PASS";
}

function TestRemoveAndRename() {
  var ws = workspace.Create({
    name: "ops-test",
    owner: "user-1",
    node: "default",
  });
  ws.WriteFile("del.txt", "delete me");
  ws.Remove("del.txt");
  if (ws.Exists("del.txt")) throw new Error("Remove failed");

  ws.MkdirAll("rmdir/sub");
  ws.WriteFile("rmdir/sub/f.txt", "nested");
  ws.RemoveAll("rmdir");
  if (ws.Exists("rmdir")) throw new Error("RemoveAll failed");

  ws.WriteFile("old.txt", "rename me");
  ws.Rename("old.txt", "new.txt");
  if (ws.Exists("old.txt")) throw new Error("old still exists after rename");
  if (!ws.Exists("new.txt")) throw new Error("new doesn't exist after rename");

  workspace.Delete(ws.id);
  return "PASS";
}

function TestBase64() {
  var ws = workspace.Create({
    name: "b64-test",
    owner: "user-1",
    node: "default",
  });
  ws.WriteFile("src.txt", "base64 test data");
  var b64 = ws.ReadFileBase64("src.txt");
  if (!b64 || b64.length === 0) throw new Error("ReadFileBase64 returned empty");

  ws.WriteFileBase64("dst.txt", b64);
  var content = ws.ReadFile("dst.txt");
  if (content !== "base64 test data")
    throw new Error("base64 roundtrip failed: " + content);

  workspace.Delete(ws.id);
  return "PASS";
}

function TestCopyInternal() {
  var ws = workspace.Create({
    name: "copy-internal",
    owner: "user-1",
    node: "default",
  });
  ws.WriteFile("src.txt", "copy me");
  ws.Copy("src.txt", "dst.txt");
  var content = ws.ReadFile("dst.txt");
  if (content !== "copy me") throw new Error("copy content mismatch: " + content);

  ws.MkdirAll("srcdir");
  ws.WriteFile("srcdir/a.txt", "aaa");
  ws.WriteFile("srcdir/b.txt", "bbb");
  ws.Copy("srcdir", "dstdir");
  if (ws.ReadFile("dstdir/a.txt") !== "aaa") throw new Error("dir copy a.txt failed");
  if (ws.ReadFile("dstdir/b.txt") !== "bbb") throw new Error("dir copy b.txt failed");

  workspace.Delete(ws.id);
  return "PASS";
}

function TestZipUnzip() {
  var ws = workspace.Create({
    name: "zip-test",
    owner: "user-1",
    node: "default",
  });
  ws.MkdirAll("src");
  ws.WriteFile("src/hello.txt", "zip content");
  ws.WriteFile("src/world.txt", "more content");

  var zipResult = ws.Zip("src", "archive.zip");
  if (!zipResult || zipResult.files_count < 2)
    throw new Error("Zip failed: " + JSON.stringify(zipResult));

  var unzipResult = ws.Unzip("archive.zip", "out");
  if (!unzipResult || unzipResult.files_count < 2)
    throw new Error("Unzip failed: " + JSON.stringify(unzipResult));

  var content = ws.ReadFile("out/hello.txt");
  if (content !== "zip content") throw new Error("unzipped content mismatch: " + content);

  workspace.Delete(ws.id);
  return "PASS";
}

function TestGzipGunzip() {
  var ws = workspace.Create({
    name: "gzip-test",
    owner: "user-1",
    node: "default",
  });
  ws.WriteFile("data.txt", "gzip test data");

  var gzResult = ws.Gzip("data.txt", "data.txt.gz");
  if (!gzResult || gzResult.files_count !== 1)
    throw new Error("Gzip failed: " + JSON.stringify(gzResult));

  var gunzipResult = ws.Gunzip("data.txt.gz", "restored.txt");
  if (!gunzipResult || gunzipResult.files_count !== 1)
    throw new Error("Gunzip failed: " + JSON.stringify(gunzipResult));

  var content = ws.ReadFile("restored.txt");
  if (content !== "gzip test data")
    throw new Error("gunzip content mismatch: " + content);

  workspace.Delete(ws.id);
  return "PASS";
}

function TestTarUntar() {
  var ws = workspace.Create({
    name: "tar-test",
    owner: "user-1",
    node: "default",
  });
  ws.MkdirAll("src");
  ws.WriteFile("src/a.txt", "tar a");
  ws.WriteFile("src/b.txt", "tar b");

  var tarResult = ws.Tar("src", "archive.tar");
  if (!tarResult || tarResult.files_count < 2)
    throw new Error("Tar failed: " + JSON.stringify(tarResult));

  var untarResult = ws.Untar("archive.tar", "out");
  if (!untarResult || untarResult.files_count < 2)
    throw new Error("Untar failed: " + JSON.stringify(untarResult));

  if (ws.ReadFile("out/a.txt") !== "tar a") throw new Error("untar content mismatch");

  workspace.Delete(ws.id);
  return "PASS";
}

function TestTgzUntgz() {
  var ws = workspace.Create({
    name: "tgz-test",
    owner: "user-1",
    node: "default",
  });
  ws.MkdirAll("src");
  ws.WriteFile("src/x.txt", "tgz x");

  var tgzResult = ws.Tgz("src", "archive.tgz");
  if (!tgzResult || tgzResult.files_count < 1)
    throw new Error("Tgz failed: " + JSON.stringify(tgzResult));

  var untgzResult = ws.Untgz("archive.tgz", "out");
  if (!untgzResult || untgzResult.files_count < 1)
    throw new Error("Untgz failed: " + JSON.stringify(untgzResult));

  if (ws.ReadFile("out/x.txt") !== "tgz x") throw new Error("untgz content mismatch");

  workspace.Delete(ws.id);
  return "PASS";
}

function TestZipExcludes() {
  var ws = workspace.Create({
    name: "zip-excludes",
    owner: "user-1",
    node: "default",
  });
  ws.MkdirAll("src");
  ws.WriteFile("src/keep.txt", "keep");
  ws.WriteFile("src/skip.log", "skip");

  var zipResult = ws.Zip("src", "filtered.zip", { excludes: ["*.log"] });
  if (!zipResult) throw new Error("Zip with excludes failed");

  ws.Unzip("filtered.zip", "out");
  if (!ws.Exists("out/keep.txt")) throw new Error("keep.txt should exist");
  if (ws.Exists("out/skip.log")) throw new Error("skip.log should be excluded");

  workspace.Delete(ws.id);
  return "PASS";
}

function RunAll() {
  var tests = [
    "TestCreate",
    "TestGet",
    "TestList",
    "TestReadWriteFile",
    "TestReadDir",
    "TestStat",
    "TestExistsIsDirIsFile",
    "TestRemoveAndRename",
    "TestBase64",
    "TestCopyInternal",
    "TestZipUnzip",
    "TestGzipGunzip",
    "TestTarUntar",
    "TestTgzUntgz",
    "TestZipExcludes",
  ];

  var results = [];
  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var name = tests[i];
    try {
      var fn = eval(name);
      fn();
      results.push(name + ": PASS");
      passed++;
    } catch (e) {
      results.push(name + ": FAIL - " + e.message);
      failed++;
    }
  }

  return {
    total: tests.length,
    passed: passed,
    failed: failed,
    results: results,
  };
}
