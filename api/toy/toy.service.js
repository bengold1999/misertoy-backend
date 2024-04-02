import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

async function query(filterBy = { txt: '' }, sortBy = { type: 'name', dir: 1}) {
    try {
        let criteria = {
            name: { $regex: filterBy.txt, $options: 'i' }
        }
        
        if (filterBy.inStock !== undefined && filterBy.inStock !== null && filterBy.inStock !== '') {
            criteria.inStock = { $eq: JSON.parse(filterBy.inStock) };
        }
        
        if (filterBy.labels && filterBy.labels.length > 0) {
            criteria.labels = { $all: filterBy.labels };
        }

        const collection = await dbService.getCollection('toy')
        const sortOption = {
            [sortBy.type || 'name']: parseInt(sortBy.dir) || 1
        }
        const toys = await collection.find(criteria).sort(sortOption).toArray()

        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        var toy = collection.findOne({ _id: new ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: new ObjectId(toyId) })
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        console.log(toy)
        const toyToSave = {
            name: toy.name,
            price: toy.price,
            labels: toy.labels,
            inStock: toy.inStock,
            createdAt: toy.createdAt,
        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

const uploadImg = async (ev) => {
    //Defining our variables
    // const CLOUD_NAME = 'insert1'
    const CLOUD_NAME = 'dheh8zkmv'
    const UPLOAD_PRESET = 'toy_upload'
    // const UPLOAD_PRESET = 'insert2'
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    const FORM_DATA = new FormData()
    
    //Bulding the request body
    FORM_DATA.append('file', ev.target.files[0])
    FORM_DATA.append('upload_preset', UPLOAD_PRESET)
  
    // Sending a post method request to Cloudinarys API
  
    try {
      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: FORM_DATA,
      })
      const elImg = document.createElement('img')
      const { url } = await res.json()
      elImg.src = url
      document.body.append(elImg)
    } catch (err) {
      console.error(err)
    }
  }

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg,
    uploadImg,
}
