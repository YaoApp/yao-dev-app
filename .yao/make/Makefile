GO ?= go
GIT ?= git
APP_NAME = dev-app
PACK_FLAG = -l 123456
DIST = $(abspath ../../dist)
TEMP = ./.tmp
APP_ROOT = $(abspath ../../)
PACK_ROOT = $(abspath ../pack)
VERSION := $(shell grep 'version' ../../app.* | awk '{print $$2}' | sed 's/\"//g' | sed 's/,//g')
COMMIT := $(shell git log | head -n 1 | awk '{print substr($$2, 0, 12)}')
NOW := $(shell date +"%FT%T%z")


.PHONY: tools
tools:
	go install github.com/go-bindata/go-bindata/...@latest;
	

.PHONY: checkout
checkout:
	rm -rf $(TEMP)
	mkdir -p $(TEMP)
	$(GIT) clone  https://github.com/YaoApp/yao.git $(TEMP)/yao
	$(GIT) clone  https://github.com/YaoApp/gou.git $(TEMP)/gou
	$(GIT) clone  https://github.com/YaoApp/xun.git $(TEMP)/xun
	$(GIT) clone  https://github.com/YaoApp/kun.git $(TEMP)/kun
	$(GIT) clone https://github.com/YaoApp/xgen.git  $(TEMP)/xgen
	$(GIT) clone  https://github.com/YaoApp/v8go.git $(TEMP)/v8go


.PHONY: patch
patch:
# Patching Yao
	cp $(PACK_ROOT)/pack.go $(TEMP)/yao/pack/pack.go

#	Replace PRVERSION
	sed -ie "s/const BUILDIN = false/const BUILDIN = true/g" $(TEMP)/yao/share/const.go
	sed -ie "s/const PRVERSION = \"DEV\"/const PRVERSION = \"${COMMIT}-${NOW}\"/g" $(TEMP)/yao/share/const.go
	sed -ie "s/const BUILDNAME = \"yao\"/const BUILDNAME = \"${APP_NAME}\"/g" $(TEMP)/yao/share/const.go

.PHONY: pack
pack: 
	rm -rf $(TEMP)/yao/yao/release
	mkdir -p $(TEMP)/yao/yao/release
	echo "YAO_ROOT=$(APP_ROOT)" > $(TEMP)/yao/.env
	cd $(TEMP)/yao && $(GO) run . pack $(PACK_FLAG) -o yao/release

.PHONY: xgen
xgen: 
#	Building XGEN v1.0
	export NODE_ENV=production
	echo "BASE=__yao_admin_root" > $(TEMP)/xgen/packages/xgen/.env
	cd $(TEMP)/xgen && pnpm install --no-frozen-lockfile && pnpm run build

#   Setup UI
	cd $(TEMP)/xgen/packages/setup  && pnpm install --no-frozen-lockfile && pnpm run build

.PHONY: bindata
bindata:
	mkdir -p $(DIST)
	mkdir -p $(TEMP)/bindata/data/xgen

	cp -r $(TEMP)/yao/yao $(TEMP)/bindata/data/yao
	cp -r $(TEMP)/xgen/packages/setup/build $(TEMP)/bindata/data/xgen/setup
	cp -r $(TEMP)/xgen/packages/xgen/dist $(TEMP)/bindata/data/xgen/v1.0
	go-bindata -fs -pkg data -o $(TEMP)/yao/data/bindata.go -prefix "$(TEMP)/bindata/data/" $(TEMP)/bindata/data/...

.PHONY: macos
macos: 
	mkdir -p $(DIST)
	cd $(TEMP)/yao && CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 go build -v -o $(DIST)/$(APP_NAME)-${VERSION}-darwin-amd64
	cd $(TEMP)/yao && CGO_ENABLED=1 GOOS=darwin GOARCH=arm64 go build -v -o $(DIST)/$(APP_NAME)-${VERSION}-darwin-arm64
	chmod +x $(DIST)/$(APP_NAME)-${VERSION}-darwin-amd64
	chmod +x $(DIST)/$(APP_NAME)-${VERSION}-darwin-arm64


.PHONY: linux
linux: 
	mkdir -p $(DIST)
	cd $(TEMP)/yao && CGO_ENABLED=1 CGO_LDFLAGS="-static" GOOS=linux GOARCH=amd64 go build -v -o $(DIST)/$(APP_NAME)-${VERSION}-linux-amd64
	cd $(TEMP)/yao && CGO_ENABLED=1 CGO_LDFLAGS="-static" GOOS=linux GOARCH=arm64 CC=aarch64-linux-gnu-gcc CXX=aarch64-linux-gnu-g++ go build -v -o $(DIST)/$(APP_NAME)-${VERSION}-linux-arm64
	chmod +x $(DIST)/$(APP_NAME)-${VERSION}-linux-amd64
	chmod +x $(DIST)/$(APP_NAME)-${VERSION}-linux-arm64

.PHONY: build-macos
build-macos: tools clean checkout patch pack xgen bindata macos

.PHONY: build-linux
build-linux: tools clean checkout patch pack xgen bindata linux

.PHONY: build-macos-action
build-macos-action: patch pack xgen bindata macos

.PHONY: build-linux-action
build-linux-action: patch pack xgen bindata linux

.PHONY: clean
clean:
	rm -rf $(TEMP)