# Backoffice Local Development :: Overview

This repository provides: 

1. a local environment to develop frontend backoffice configurations
2. a set of tutorials to get started with backoffice configuration development

## Environment

Using ```yarn start``` on your local machine: 

1. a `docker-compose` environment starts
2. a `mock-server` runs

The `docker-compose` environment is described by its [config yaml](../docker-compose.yml) and provides

1. a nginx reverse proxy configurable from its [nginx.conf](../reverse-proxy/conf/nginx.conf) file
2. a micro-lc frontend web-server
3. micro-lc element-composer plugin
4. backoffice JS web-component library

The reverse proxy proxy passes to the `mock-server` which in turn plays the role of both a
configuration server and a backend or data source.

![docker-compose environment](img/docker-compose_env.svg)

Docker container versions used within the `docker-compose` configuration can be [tuned](30_versioning.md)

### micro-lc

[micro-lc] requires a bunch of config files which are provided by the mock server at
`<repo-root-dir>/micro-lc`. In such folder you'll find an `authentication.json` and 
a `configuration.json` to configure which micro-frontend plugin visualize.

### micro-lc element composer

It's pretty much as it is out of the box and no special configuration is needed. Just remind that 
backoffice plugins are written as configurations for the `element-composer` which renders them after 
been registered by `micro-lc` on the browser.

### back-kit

It's a web server which contains the Backoffice webcomponent JS library bundle. The bundle is downloaded 
anytime is invoked by the `element-composer`. Since this is a development environment, the reverse proxy provides 
no server-side caching of the library. To override this behaviour see [caching](35_caching.md)

### micro-lc notification center

It's optional and provides an extra webcomponent JS library which provides a tiny notification center 
frontend.

[micro-lc]: https://micro-lc.io