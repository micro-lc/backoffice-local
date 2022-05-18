const Cities = require('../utils/crud-interface')
const {
  crudBaseGenerator,
} = require('../utils/generators')
const c = require('cities.json')

const mockCities = () =>
  c.map(({name}) => {
    return {
      ...crudBaseGenerator(),
      __STATE__: 'PUBLIC',
      name
    }
  })

const cities = new Cities(0, mockCities, true)

module.exports = cities
