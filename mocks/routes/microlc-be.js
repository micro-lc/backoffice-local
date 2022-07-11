const {JSONPath} = require('jsonpath-plus')
const {existsSync, readFile} = require('fs')
const {resolve} = require('path')

const {notFound, serverError} = require('../utils/responses')
const {aclExpressionEvaluator} = require('../utils/json-utils')

const configFolder = '../../micro-lc'
const __spec = ['configuration.json', 'authentication.json', 'micro-lc-base.js']

const groups = ['admin', 'users']

const mutateCallback = ($ref) => (payload) => {
  Object.assign(payload, $ref[payload.$ref])
  delete payload.$ref
}

function replace ({$ref, content}) {
  JSONPath({path: '$..$ref^', json: content, callback: mutateCallback($ref)})
  return content
}

function referencesReplacer (configuration) {
  const isReplaceable = configuration.$ref && configuration.content
  return isReplaceable ? replace(configuration) : configuration
}

function replaceBackKitVersion (input, context = process.env) {
  if (input === undefined || input === null) {
    return input
  }

  if (Array.isArray(input)) {
    return input.map((el) => replaceBackKitVersion(el, context))
  } else {
    switch (typeof input) {
    case 'object':
      return Object.fromEntries(
        Object.entries(input).map(([k, v]) => [k, replaceBackKitVersion(v, context)])
      )
    case 'string':
      return input.match(/{{BACK_KIT_VERSION}}/) ? input.replace(/{{BACK_KIT_VERSION}}/g, process.env.BACK_KIT_VERSION) : input
    default:
      return input
    }
  }
}

module.exports = [
  {
    id: 'base-config',
    url: '/api/v1/microlc/:config',
    method: 'GET',
    variants: [
      {
        id: 'ok',
        response: ({params}, res) => {
          if(params && params.config) {
            const {config} = params
            const name = config.match(/\.[^.]+/) ? config : `${config}.json`
            const path = resolve(__dirname, configFolder, name)
            if(__spec.includes(name) && existsSync(path)) {
              res.status(200).set({
                'Content-Type': 'application/json'
              }).sendFile(path)
              return
            }

            notFound(res)
            return
          }

          serverError(res)
        }
      }
    ]
  },
  {
    id: 'plugins',
    url: '/api/v1/microlc/configuration/:plugin',
    method: 'GET',
    variants: [
      {
        id: 'ok',
        response: ({params}, res) => {
          if(params && params.plugin) {
            const {plugin} = params
            const name = plugin.match(/\.[^.]+/) ? plugin : `${plugin}.json`
            const path = resolve(__dirname, configFolder, name)
            if(existsSync(path)) {
              readFile(path, (err, buf) => {
                if(err) {
                  serverError(res)
                } else {
                  const ext = name.match(/\.[^.]+/)
                  if(!ext) {
                    res.status(200).set({
                      'Content-Type': 'text/plain'
                    }).send(buf)
                  }
                  switch (ext[0]) {
                  case '.json': {
                    const obj = JSON.parse(buf)
                    res.status(200).set({
                      'Content-Type': name.match(/\.json$/) ? 'application/json' : 'application/javascript'
                    }).json(
                      referencesReplacer(
                        aclExpressionEvaluator(
                          replaceBackKitVersion(obj), groups
                        )
                      )
                    )
                    return
                  }
                  case '.js': 
                    res.status(200).set({
                      'Content-Type': 'text/plain'
                    }).send(buf)
                    return
                  default:
                    return
                  }
                }
              })
              return
            }

            notFound(res)
            return
          }

          serverError(res)
        }
      }
    ]
  },
  {
    id: 'userinfo',
    url: '/userinfo',
    method: 'GET',
    variants: [
      {
        id: 'test',
        response: {
          status: 200,
          body: {
            aud: 'u9saCatviTKQw2hCx77Pxn5yF3UUFCbJ',
            email: 'test@mia-platform.eu',
            email_verified: true,
            exp: 1641840144,
            groups,
            iat: 1641804144,
            iss: 'http://localhost:8080/',
            name: 'test@mia-platform.eu',
            nickname: 'test.user',
            picture: 'https://s.gravatar.com/avatar/ebfa271dd832b0061a9371421ef4de69?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fum.png',
            sub: 'auth0|61e54570768813c31c35e251',
            updated_at: new Date().toISOString()
          }
        }
      }
    ]
  }
]
