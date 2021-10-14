const express = require('express');
const { getTree, startManager } = require('../controlers/managerControler');
const { createQueue, deleteQueue } = require('../middlewares/sqs');

const router = new express.Router();

router.get('/get-tree',deleteQueue,getTree)

router.post('/start-manager',createQueue,startManager)

// router.post('/get-url',getUrl)


module.exports = router;