const { sendWorkPropertiesToRedis, initCurrentLevelDataInRedis, getAllUrlsInRedis } = require("../utils/redis");
const { sendRootUrlToQueue } = require("../utils/sqs");
const Axios = require("axios");
const Tree = require("../utils/tree");

let tree;
let maxPages;
let maxiDepth;
let missionRoot;
let workID = 0;

const getTree = async (req, res) => {
  try {
    const allUrls = await getAllUrlsInRedis({ workID, maxPages });
    console.log("all", allUrls.length);

    // ! here we should build the tree

    res.send(allUrls);
  } catch (error) {
    console.log("12333", error);
    res.status(500).send({
      status: 500,
      message: "Manager failed to send tree",
    });
  }
};

const startManager = async (req, res) => {
  const { rootUrl, maxDepth, maxTotalPages } = req.body;
  const QueueUrl = req.QueueUrl;
  const finished = false;
  let port = 8000;
  const url = `http://localhost:${port}`;
  try {
    res.send({ QueueUrl, workID });
    tree = new Tree();
    maxPages = maxTotalPages;
    maxiDepth = maxDepth;
    missionRoot = rootUrl;
    workID++;
    await sendRootUrlToQueue({ url: rootUrl, rootUrl, QueueUrl, workID });
    await sendWorkPropertiesToRedis({ rootUrl, maxDepth, maxTotalPages, finished, workID });
    await initCurrentLevelDataInRedis(workID);
    await Axios.post(url + `/crawl?workID=${workID}`);
    // port++;
  } catch (error) {
    console.log("err1", error);
  }
};

module.exports = {
  getTree,
  startManager,
  // getUrl
};
