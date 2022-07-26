# Versioning

Each service in the `docker-compose` config file carries a version and such
version can be set from the `.env` file in the root folder.

Version variables must have consistent names:

1. back-kit -> `BACK_KIT_VERSION` (defaults to `unstable`)
2. micro-lc -> `MICRO_LC_VERSION` (defaults to `latest`)
3. element-composer -> `ELEMENT_COMPOSER_VERSION` (defaults to `latest`)
4. micro-lc-notification-center -> `NOTIFICATION_CENTER_VERSION` (defaults to `latest`)

and, after change, a re-start is needed via:

```shell
yarn start:env [--force-recreate]
```

moreover, if `BACK_KIT_VERSION` was changed, also the mock-server must be re-started via:

```shell
yarn start:server
```

Be careful to be consistent in your plugins configurations, and wherever the `BACK_KIT_VERSION`
variable is needed (e.g., declaring the components library url), it must be referenced with handlebars syntax

```json
{
  ...
  "url": "/back-kit/{{BACK_KIT_VERSION}}/bk-web-components.esm.js",
  ...
}
```