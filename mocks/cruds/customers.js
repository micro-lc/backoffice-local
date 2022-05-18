const Customers = require('../utils/crud-interface')
const {
  crudBaseGenerator,
  genFirstName,
  genLastName,
  addressGenerator,
  randomNumber,
  getRandomFromCollection
} = require('../utils/generators')
const cities = require('./cities')

const mockCustomers = (quantity) =>
  Array(quantity)
    .fill(0)
    .map(() => {
      return {
        ...crudBaseGenerator(),
        firstName: genFirstName(),
        lastName: genLastName(),
        cityOfBirth: getRandomFromCollection(cities.items)._id,
        address: addressGenerator(),
        activeOrders: randomNumber(0, 2),
        pastOrders: randomNumber(0, 200)
      }
    })

const customers = new Customers(1000, mockCustomers, true)

module.exports = customers
