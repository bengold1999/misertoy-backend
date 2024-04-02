import fs from 'fs'
import { utilService } from './util.service.js'
// import { logger } from './logger.service.js'



// const STORAGE_KEY = 'toyDB'
const toys = utilService.readJsonFile('data/toy.json')


export const toyService = {
    query,
    getById,
    save,
    remove,
    getEmptytoy,
    getDefaultFilter,
    getEmptyRandomtoy,
    getLabels,
    getDefaultSort,
}
function query(filterBy ,sortBy) {
    let toysToShow = toys
    // if (!filterBy.txt) filterBy.txt = ''
    // if (!filterBy.inStock) filterBy.inStock = ''
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        toysToShow = toysToShow.filter(toy => regExp.test(toy.name))
    }


    if (filterBy.inStock) {
        toysToShow = toysToShow.filter(toy => toy.inStock === JSON.parse(filterBy.inStock))
    }
    if (filterBy.labels && filterBy.labels.length) {
        toysToShow = toysToShow.filter(toy =>
            filterBy.labels.some(label => Array.isArray(toy.labels) && toy.labels.includes(label))
        )
    }
  
    if (sortBy.type === 'createdAt') {
        toysToShow.sort((b1, b2) => (+sortBy.dir) * (b1.createdAt - b2.createdAt))
    } else if (sortBy.type === 'price') {
        toysToShow.sort((b1, b2) => (+sortBy.dir) * (b1.price - b2.price))
    } else if (sortBy.type === 'name') {
        toysToShow.sort((a, b) => sortBy.dir * a.name.localeCompare(b.name))
    }
    // console.log(toysToShow)
    return Promise.resolve(toysToShow);
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such toy')
    toys.splice(idx, 1)
    _savetoysToFile()
    return Promise.resolve()
}


function save(toy) {
    if (toy._id) {
        const toyToUpdate = toys.find(currtoy => currtoy._id === toy._id)
        toyToUpdate.name = toy.name
        toyToUpdate.labels = toy.labels
        toyToUpdate.price = toy.price
        toyToUpdate.inStock = toy.inStock
        toyToUpdate.createdAt = toy.createdAt
        toy = toyToUpdate

    } else {
        toy._id = utilService.makeId()
        // if(!toy.name)
        // when switching to backend - remove the next line
        // toy.owner = userService.getLoggedinUser()
        toys.unshift(toy)
    }
    _savetoysToFile()
    return Promise.resolve(toy)

}

function getLabels() {
    return ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle',
        'Outdoor', 'Battery Powered']
}
const labels = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle',
    'Outdoor', 'Battery Powered']

function getEmptytoy() {
    return {
        name: '',
        price: 5,
        labels: [],
        createdAt: Date.now(),
        inStock: true,
    }
}
function getEmptyRandomtoy() {
    return {
        name: utilService.makeLorem(2),
        price: 30,
        labels: ['Doll', 'Battery Powered', 'Baby'],
        createdAt: Date.now(),
        inStock: true,
    }
}


function getDefaultFilter() {
    return { txt: '', labels: [], inStock: null }
}
function getDefaultSort() {
    return { type: '', dir: 1 }
}


function _savetoysToFile() {
    fs.writeFileSync('data/toy.json', JSON.stringify(toys, null, 2))
}