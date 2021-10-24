const express = require("express");
const { getTree, startManager } = require("../controlers/managerControler");
const { checkIfCrawlDoneRedis } = require("../middlewares/redis");
const { createQueue } = require("../middlewares/sqs");

const router = new express.Router();

router.get("/get-tree", checkIfCrawlDoneRedis, getTree);

router.post("/start-manager", createQueue, startManager);

// router.post('/get-url',getUrl)

module.exports = router;
