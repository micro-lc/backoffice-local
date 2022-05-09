FROM nginx:1.20.2

ARG NGINX_SCOPE=.

COPY ./conf/includes/mime.types /etc/nginx/includes/mime.types
COPY ./conf/includes/proxy.conf /etc/nginx/includes/proxy.conf
COPY ./conf/nginx${NGINX_SCOPE}conf /etc/nginx/nginx.conf
