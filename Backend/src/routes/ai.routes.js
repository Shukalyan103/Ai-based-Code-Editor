
const express=require('express')

const aiController=require('../controllers/ai.controller')

const route = express.Router()

route.post('/get-code',aiController.getCodeData)
route.post('/get-PromtData',aiController.getPromtData)

module.exports = route;