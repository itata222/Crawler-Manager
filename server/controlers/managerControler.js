const {
  sendWorkPropertiesToRedis,
  initCurrentLevelDataInRedis,
  getLatestDataFromRedis,
  pushRootUrlNodeToTreeListInRedis,
  getAndSetWorkID,
} = require("../utils/redis");
const { sendRootUrlToQueue } = require("../utils/sqs");
const Axios = require("axios");

const getTree = async (req, res) => {
  const finished = req.finished;
  const updatedWorkID = parseInt(req.query.workID);
  try {
    const allUrls = await getLatestDataFromRedis({ workID: updatedWorkID });
    console.log("manager-controller-get tree: all", allUrls.length, finished, updatedWorkID);
    res.send({ tree: allUrls, finished });
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

  try {
    const workID = await getAndSetWorkID();
    res.send({ QueueUrl, workID });
    await sendRootUrlToQueue({ url: rootUrl, rootUrl, QueueUrl, workID });
    await pushRootUrlNodeToTreeListInRedis(workID, { myAddress: rootUrl, parentPosition: 0, depth: 0, parentAddress: "null" });
    await sendWorkPropertiesToRedis({ rootUrl, maxDepth, maxTotalPages, finished, workID });
    await initCurrentLevelDataInRedis(workID, maxTotalPages);
    await Axios.post(`http://localhost:8000/crawl?workID=${workID}`);
    // await Axios.post(`http://localhost:8080/crawl?workID=${workID}`);
  } catch (error) {
    console.log("err1", error.message);
  }
};

module.exports = {
  getTree,
  startManager,
};
