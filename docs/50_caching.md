# Caching

## back-kit

Back-kit has no server-side cache on the nginx reverse proxy. To activate it (if no version update of back-kit is needed)
please comment cache directives on [nginx config file](../reverse-proxy/conf/nginx.conf) as hinted by the following snippet

```nginx
# back-kit
location /back-kit {
    rewrite                         /back-kit/(.*) /$1 break;
    index                           index.html;
    include                         /etc/nginx/includes/proxy.conf;
    proxy_pass                      http://back-kit:8080;

    # kill cache
    ## Comment from here 👇
    add_header Last-Modified $date_gmt;
    add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
    if_modified_since off;
    expires off;
    etag off;
    ## Until here 👆
}
```