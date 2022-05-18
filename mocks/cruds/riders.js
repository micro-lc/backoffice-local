const Riders = require('../utils/crud-interface')
const {crudBaseGenerator} = require('../utils/generators')
const {
  genFirstName,
  genLastName,
  getRandomFromCollection
} = require('../utils/generators.js')

const mockRiders = (quantity) =>
  Array(quantity)
    .fill(0)
    .map(() => {
      return {
        ...crudBaseGenerator(),
        // 👇 add from here
        firstName: genFirstName(),
        lastName: genLastName(),
        transport: getRandomFromCollection(['CAR', 'BIKE', 'MOTORBIKE'])
      }
    })

const riders = new Riders(1000, mockRiders, true)

module.exports = riders
