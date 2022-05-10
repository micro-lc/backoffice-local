const {
  genId,
  getRandomFromCollection,
  oldestFirst
} = require('../utils/generators')

class Crud {
  items
  shouldSort

  constructor (quantity, mockItems, shouldSort = true) {
    this.shouldSort = shouldSort
    this.items = mockItems(quantity)
    this.sort()
  }

  sort () {
    this.shouldSort && this.items.sort(({createdAt: a}, {createdAt: b}) => -oldestFirst(a, b))
  }

  slice (start, end) {
    return this.items.slice(start, end)
  }

  addNew (item) {
    const _id = genId()
    const creatorId = genId()
    const createdAt = new Date().toISOString()
    this.items.push({
      ...item,
      _id,
      creatorId,
      createdAt,
      updaterId: creatorId,
      updatedAt: createdAt, 
      __STATE__: item.__STATE__ ?? getRandomFromCollection(['PUBLIC', 'DRAFT', 'TRASH'])
    })

    this.sort()
  
    return _id
  }
}

module.exports = Crud
