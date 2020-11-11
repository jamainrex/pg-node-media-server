FROM node:12-alpine

WORKDIR /tmp/ffmpeg

ENV FFMPEG_VERSION="4.2.2"
ENV FFMPEG_VERSION_URL="http://ffmpeg.org/releases/ffmpeg-${FFMPEG_VERSION}.tar.bz2"
ENV BIN="/usr/bin"

RUN cd && \
    apk update && \
    apk upgrade && \
    apk add \
    freetype-dev \
    openssl-dev \
    lame-dev \
    libass-dev \
    libogg-dev \
    libtheora-dev \
    libvorbis-dev \
    libvpx-dev \
    libwebp-dev \
    libssh2 \
    opus-dev \
    rtmpdump-dev \
    x264-dev \
    x265-dev \
    yasm-dev && \
    apk add --no-cache --virtual \
    .build-dependencies \
    build-base \
    bzip2 \
    coreutils \
    openssl \
    nasm \
    tar \
    x264

RUN wget "${FFMPEG_VERSION_URL}" && \
    tar xjvf "ffmpeg-${FFMPEG_VERSION}.tar.bz2"

# Reference: https://www.iiwnz.com/compile-ffmpeg-with-rtmps-for-facebook/

RUN cd ffmpeg* && \
    PATH="$BIN:$PATH" && \
    ./configure --help && \
    ./configure --bindir="$BIN" --disable-debug \
    --disable-doc \
    --disable-ffplay \
    --enable-avresample \
    --enable-gpl \
    --enable-libass \
    --enable-libfreetype \
    --enable-libmp3lame \
    --enable-libopus \
    --enable-librtmp \
    --enable-libtheora \
    --enable-libvorbis \
    --enable-libvpx \
    --enable-libwebp \
    --enable-libx264 \
    --enable-libx265 \
    --enable-nonfree \
    --enable-postproc \
    --enable-openssl \
    --enable-small \
    --enable-version3 && \
    make -j4 && \
    make install && \
    make distclean && \
    rm -rf "/tmp/ffmpeg"  && \
    apk del --purge .build-dependencies && \
    rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --production

COPY . .

EXPOSE 1935 8000

CMD ["node","app.js"]