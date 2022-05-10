const firstNames = require('./first-names')
const lastNames = require('./last-names')

const START_DAYS_AGO = 90
const today = new Date()
const startFrom = new Date(today.getTime())
startFrom.setTime(today.getTime() - START_DAYS_AGO * 24 * 60 * 60 * 1000)

function genId () {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16)
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
    return (Math.random() * 16 | 0).toString(16)
  }).toLowerCase()
}

function randomDate (start = startFrom, end = today) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomString (length = 10) {
  let result = ''
  const characters = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const streetNumber = randomNumber(1, 100).toString()
const streetName = ['A street', 'B street', 'C street', 'D street', 'E street', 'F street']
const cityName = ['Milan', 'Rome', 'Denver', 'Tokyo', 'Berlino', 'Palermo', 'Nairobi', 'Bogotà', 'Oslo']
const stateName = ['Qassem State', 'North State', 'East State', 'South State', 'West State']
const zipCode = ['28889', '96459', '35748', '15005', '99625', '71465']
const template = [streetNumber, ' ', streetName, ', ', cityName, ' ', stateName, ', ', zipCode]
function addressGenerator() {
  return template.map(getRandomElement).join('')
}

function getRandomElement(array) {
  if (array instanceof Array) return array[Math.floor(Math.random() * array.length)]
  else return array
}

function randomNumber (start = 0, end = 10) {
  return Math.floor(Math.random() * end) + start
}

function getRandomFromCallback (cb, maxQuantity) {
  if(typeof maxQuantity === 'number') {
    const num = randomNumber(0, maxQuantity)
    return Array(num).fill(0).map(
      cb
    )
  }

  return cb()
}

function getRandomFromCollection (collection, maxQuantity) {
  if(typeof maxQuantity === 'number') {
    const num = randomNumber(0, maxQuantity)
    return Array(num).fill(0).map(
      () => collection[randomNumber(0, collection.length)]
    )
  }

  return collection[randomNumber(0, collection.length)]
}

function emailGenerator (first, last, domains = ['mia-platform.eu']) {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'
  if(first && last) {
    return `${first}.${last}@${getRandomFromCollection(domains)}`.toLowerCase()
  }
  
  let string = ''
  for(var ii=0; ii<15; ii++){
    string += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${string}@${getRandomFromCollection(domains)}`
}

const crudBaseGenerator = () => {
  const creatorId = genId()
  const createdAt = randomDate()
  return {
    _id: genId(),
    creatorId,
    createdAt,
    updaterId: creatorId,
    updatedAt: createdAt, 
    __STATE__: getRandomFromCollection(['PUBLIC', 'DRAFT', 'TRASH'])
  }
}

function contentGenerator (max = 30) {
  const words = ['The sky', 'above', 'the port', 'was', 'the color of television', 'tuned', 'to', 'a dead channel', '.', 'All', 'this happened', 'more or less', '.', 'I', 'had', 'the story', 'bit by bit', 'from various people', 'and', 'as generally', 'happens', 'in such cases', 'each time', 'it', 'was', 'a different story', '.', 'It', 'was', 'a pleasure', 'to', 'burn']
  const text = []
  Array(randomNumber(0, max)).fill(0).forEach(() => {
    text.push(words[randomNumber(0, words.length)])
  })

  return text.join(' ')
}

function ibanGenerator () {
  let a = randomNumber(1,999_999).toString()
  const {length} = a
  if(length < 6) {
    const r = 6 - length
    Array(r).fill(0).forEach(() => {
      a = `0${a}`
    })
  }

  const base = 'IT60X0542811101000000'
  return `${base}${a}`
}

const oldestFirst = (a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0)

const genFirstName = () => getRandomFromCollection(firstNames)
const genLastName = () => getRandomFromCollection(lastNames)


module.exports = {
  genId,
  genFirstName,
  genLastName,
  randomDate,
  randomString,
  addressGenerator,
  getRandomElement,
  randomNumber,
  emailGenerator,
  crudBaseGenerator,
  getRandomFromCollection,
  getRandomFromCallback,
  contentGenerator,
  ibanGenerator,
  oldestFirst,
  streetName,
  cityName,
  stateName,
  zipCode,
}
