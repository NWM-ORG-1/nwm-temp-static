# 컨테이너 시작 시 사이트를 빌드하므로 Railway Variables(SITE_*)를 바꾸면 재배포만으로 반영된다.
FROM nginx:1.27-alpine
RUN apk add --no-cache nodejs
ENV PORT=8080 OUT_DIR=/usr/share/nginx/html
WORKDIR /app
COPY . .
COPY nginx.conf /etc/nginx/templates/default.conf.template
RUN printf '#!/bin/sh\nset -e\nnode /app/build.js\n' > /docker-entrypoint.d/40-build-site.sh && chmod +x /docker-entrypoint.d/40-build-site.sh
