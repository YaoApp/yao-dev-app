# demo-app

Demo YAO App (Required YAO v0.10.2-beta)

Docs: https://github.com/YaoApp/website-doc-zh-CN/tree/v0.10.2/%E5%9F%BA%E7%A1%80

## Yao 0.10.2 Download

### Linux

https://github.com/YaoApp/yao/actions/runs/3486012987

### MacOS

https://github.com/YaoApp/yao/actions/runs/3486017760

### Docker

```bash
docker run -d  --name yao-0.10.2 -p 5099:5099 yaoapp/yao:0.10.2-amd64-dev
docker exec -it  yao-0.10.2 /bin/bash
```

```bash
yao start
```

## Install

```bash
yao get yaoapp/demo-app
yao start
```

## New Features

### App & Login

https://github.com/YaoApp/demo-app/blob/main/app.json

https://github.com/YaoApp/demo-app/blob/main/logins/admin.login.json

### New Table & Form & Chart

#### Bind

https://github.com/YaoApp/demo-app/tree/main/tables/bind

https://github.com/YaoApp/demo-app/tree/main/forms/bind

#### Cloud props $xxx

https://github.com/YaoApp/demo-app/blob/main/tables/pet.tab.json

#### Compute

https://github.com/YaoApp/demo-app/blob/main/tables/compute.tab.json

#### Action

https://github.com/YaoApp/demo-app/blob/main/tables/compute.tab.json#L41

### FileSystem JS API & Processes

```javascript
var fs = new FS("system"); // /app_root/data
var data = fs.ReadFile("/test.txt"); // /app_root/data/xxx
return data;
```

https://github.com/YaoApp/gou/blob/main/runtime/yao/objects/fs_test.go

### Schema JS AP & Processes

https://github.com/YaoApp/gou/blob/main/schema_test.go

### Yao Service

https://github.com/YaoApp/demo-app/tree/main/services

Action

```json
{
  "title": "测试云函数",
  "icon": "icon-cloud",
  "action": {
    "Service.foo": { "method": "Bar", "args": ["{{id}}", "{{name}}"] }
  }
}
```

### Studio CLI

https://github.com/YaoApp/demo-app/tree/main/studio

Command

```bash
yao studio run hello.World hi
```

Action

```json
{
  "title": "测试Studio",
  "icon": "icon-layers",
  "action": {
    "Studio.hello": {
      "method": "World",
      "args": ["{{id}}", "{{name}}"]
    }
  }
}
```

DSL FS

```javascript
var fs = new FS("dsl"); // /app_root (!/app_root)
var data = fs.ReadFile("/models/test.mod.json"); // /app_root/models/test.mod.json
return data;
```

Script FS

```javascript
var fs = new FS("script"); // /app_root (!/app_root/scripts)
var data = fs.ReadFile("/test.js"); // /app_root/scripts/test.js
return data;
```

### Yao Get CLI

```bash
cd project_root
yao get yaoapp/demo-app
```

### Setup UI

```bash
cd project_root
yao start
```

### AIGC 模块使用说明:

- 首先在您的 `.env`配置中加入以下配置

```json

# Redis配置
REDIS_TEST_HOST=127.0.0.1
REDIS_TEST_PORT=6379
REDIS_DB=3
REDIS_TEST_USER=""
REDIS_TEST_PASS=""

# openAI的key
OPENAI_TEST_KEY=""


```

- 然后在 `/neo/neo.yml`中加入跨域配置

```json

allows:
  - "http://127.0.0.1:8000"
  - "http://127.0.0.1:5099"
  - "http://localhost:5099"
  - "http://localhost:8000"

```

- 下载最新版本的Yao [地址](https://github.com/YaoApp/yao/actions/runs/4955485643)

- 执行`yao migrate && yao start`
  
- 在界面中的输入框输入 `/module +命令` 比如: `/module 帮我生成一个产品管理模块`  
  
  ![图片](https://release-bj-1252011659.cos.ap-beijing.myqcloud.com/docs/%E4%BD%8E%E4%BB%A3%E7%A0%81%E6%A0%87%E5%87%86/1683877912854.png)

  ![图片2](https://release-bj-1252011659.cos.ap-beijing.myqcloud.com/docs/%E4%BD%8E%E4%BB%A3%E7%A0%81%E6%A0%87%E5%87%86/1683878008968.png)

  点击执行按钮:
  ![图片3](https://release-bj-1252011659.cos.ap-beijing.myqcloud.com/docs/%E4%BD%8E%E4%BB%A3%E7%A0%81%E6%A0%87%E5%87%86/1683878273320.png)