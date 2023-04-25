# ===========================================
#  Yao Application Build
# 
#  Build:
#  docker build --platform linux/amd64 -t yaoapp/yao-build:0.10.3-amd64 .
#
#  Tests:
#  docker run -it --rm \
#       -v </your/app/root>:/app \
#       -e APP_NAME="dev-app-docker" \
#       -e PACK_FLAG="-l 123456" \
#       -e PACK_ENV="/app/pack.docker.yao" \
#       yaoapp/yao-build:0.10.3-amd64 make
#
# ===========================================
FROM ubuntu:20.04

ENV PATH="/root/go/bin/:/usr/local/go/bin:/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

# Install deps
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y libc6-armel-cross libc6-dev-armel-cross binutils-arm-linux-gnueabi libncurses5-dev build-essential bison flex libssl-dev bc \
    gcc-arm-linux-gnueabi g++-arm-linux-gnueabi \
    gcc-arm-linux-gnueabihf g++-arm-linux-gnueabihf \
    g++-aarch64-linux-gnu crossbuild-essential-arm64 \
    git curl wget

# Install nodejs
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install golang
RUN wget https://go.dev/dl/go1.20.3.linux-amd64.tar.gz -O /tmp/go1.20.3.linux-amd64.tar.gz && \
    rm -rf /usr/local/go && tar -C /usr/local -xzf /tmp/go1.20.3.linux-amd64.tar.gz && \
    rm /tmp/go1.20.3.linux-amd64.tar.gz  

# Install pnpm
RUN npm install -g pnpm 

ADD Makefile /build/Makefile


VOLUME [ "/app" ]
WORKDIR /build