const chain = require('../utils/chain')
const {serverError, notFound, badRequest} = require('../utils/responses')
const {readdirSync} = require('fs')
const {resolve} = require('path')

const files = readdirSync(resolve('./mocks/cruds'))
const cruds = files.map((n) => n.replace(/\.js$/, ''))

const variant500 = {
  id: 'ko',
  response: (_, response) => {
    serverError(response)
  }
}

function genCrud (name, endpoint = name) {
  return [
    {
      id: `${name}-get`,
      url: `/v2/${endpoint}/`,
      method: 'GET',
      variants: [
        {
          id: 'ok',
          response: (request, response) => {
            const {items} = require(`../cruds/${name}`)
            const data = chain(request, items)
            
            if(data.error) {
              response.status(404).send(data)
              return
            }

            response.set({
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }).status(200).send(data)
          }
        },
        variant500
      ]
    },
    {
      id: `${name}-get-by-id`,
      url: `/v2/${endpoint}/:id`,
      method: 'GET',
      variants: [
        {
          id: 'ok',
          response: (request, response) => {
            const {params} = request
            if(params) {
              const {id} = params
              if(id === 'count') {
                const items = chain(request, require(`../cruds/${name}`).items, {noSkip: true})
                if(items) {
                  response.set({
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                  }).status(200).send(items.length.toString())

                  return
                }
                serverError(response)
                return
              }

              if(id) {
                const data = chain(request, require(`../cruds/${name}`).items, {noSkip: true})
                if(data.error) {
                  response.status(404).send(data)
                  return
                }
                
                const el = data.find(({_id}) => id === _id)
                if(el) {
                  response.set({
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                  }).status(200).send(el)
                  return 
                }
              }
              notFound(response)
              return
            }
            serverError(response)
            return
          }
        },
        variant500
      ]
    },
    {
      id: `${name}-add-new`,
      url: `/v2/${endpoint}/`,
      method: 'POST',
      variants: [
        {
          id: 'ok',
          response: (request, response) => {
            if(request.body) {
              const _id = require(`../cruds/${name}`).addNew(request.body)
              response.status(200).json({_id})
            } else {
              serverError(response)
            }
          }
        },
        variant500
      ]
    },
    {
      id: `${name}-edit`,
      url: `/v2/${endpoint}/:id`,
      method: 'PATCH',
      variants: [
        {
          id: 'ok',
          response: (request, response) => {
            const {body, params} = request

            if(!params || !params.id) {
              badRequest(response)
              return
            }

            if(!body.$set && !body.$unset) {
              badRequest(response)
              return
            }

            const {id} = params
            const {$set, $unset} = body

            try {
              const patched = require(`../cruds/${name}`).patch(id, $set, $unset)
              response.status(200)
                .set({
                  'Content-Type': 'application/json'
                }).send(patched)
            } catch {
              notFound(response)
            }
          }
        },
        variant500
      ]
    },
    {
      id: `${name}-delete`,
      url: `/v2/${endpoint}/:id`,
      method: 'PATCH',
      variants: [
        {
          id: 'ok',
          response: (request, response) => {
            const {params} = request

            if(!params || !params.id) {
              badRequest(response)
              return
            }
            
            try {
              require(`../cruds/${name}`).delete(id)
              response.status(204).send()
            } catch {
              notFound(response)
            }

          }
        },
        variant500
      ]
    },
    {
      id: `${name}-stream`,
      url: `/v2/${endpoint}-stream`,
      method: 'GET',
      variants: [
        {
          id: 'ok',
          response: (_, response) => {
            response.writeHead(200, {
              'Content-Type': 'text/plain',
              'Transfer-Encoding': 'chunked'
            })
            require(`../cruds/${name}`).items.forEach((chunk, i, arr) => {
              let padding = '\n'
              if(arr.length === i - 1) {
                padding = ''
              }
              response.write(JSON.stringify(chunk).concat(padding))
            })

            response.end()
          }
        },
        variant500
      ]
    }
  ]
}
//   {
//     id: `export-${name}`,
//     url: `/v2/${name}/export`,
//     method: 'GET',
//     variants: [
//       {
//         id: 'all',
//         response: (_, response) => {
//           response.status(200).send(map[name].map((el) => {
//             const keys = Object.keys(el)
//             const dates = keys.reduce((acc, key) => {
//               if(
//                 typeof el === 'object' && 
//                 el[key] &&
//                 el[key].toISOString && 
//                 el[key].toISOString().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/gi)
//               ) {
//                 acc[key] = {$date: el[key]}
//               }
//               return acc
//             }, {})
//             return {
//               ...el, 
//               _id: {$oid: el._id}, 
//               createdAt: {$date: el.createdAt}, 
//               updatedAt: {$date: el.updatedAt},
//               ...dates
//             }
//           }))
//         }
//       }
//     ]
//   },
// }

// const routes = Object.keys(map).reduce((acc, name) => {
//   acc = [...acc, ...genCrud(name)]
//   return acc
// }, [])

// const stream = {
//     id: `export-stream`,
//     url: `/v2/export-data`,
//     method: 'GET',
//     variants: [
//       {
//         id: 'all',
//         response: (_, response) => {
//           response.writeHead(200, {
//             'Content-Type': 'text/plain',
//             'Transfer-Encoding': 'chunked'
//           })
//           orders.forEach((chunk, i, arr) => {
//             let padding = '\n'
//             if(arr.length === i - 1) {
//               padding = ''
//             }
//             response.write(JSON.stringify(chunk).concat(padding))
//           })

//           response.end()
//         }
//       }
//     ]
//   }

module.exports = [...cruds.reduce((c, n) => {
  c.push(...genCrud(n))
  return c
}, [])]