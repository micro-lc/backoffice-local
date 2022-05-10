# MicroLC Backend

## /userinfo

The [userinfo](../mocks/routes/microlc-be.js) is defined with a single variant `test` which returns
a generic principal context.
This route path can be modified both in response content and path but changes must be reflected into
the [authentication configuration](../micro-lc/authentication.json).
If `user groups` must be customized there's a single `const` named
`groups` in micro-lc configuration server [mocks](../mocks/routes/microlc-be.js).
