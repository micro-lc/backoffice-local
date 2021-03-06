const notFound = (res) => {res.set({
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache'
}).status(400).send({status: 400, error: 'Not Found'})}

const serverError = (res) => {res.set({
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache'
}).status(500).send({status: 500, error: 'Internal Server Error'})}

const badRequest = (res) => {
  res.set({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  }).status(400).send({status: 400, error: 'Bad Request'})
}

module.exports = {notFound, serverError, badRequest}
