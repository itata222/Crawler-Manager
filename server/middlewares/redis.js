const { checkIsWorkDone } = require("../utils/redis");

const checkIfCrawlDoneRedis = async (req, res, next) => {
  const { workID, maxDepth, maxTotalPages, QueueUrl } = req.query;
  console.log(workID, maxDepth, maxTotalPages);
  try {
    const isFinished = await checkIsWorkDone(QueueUrl, workID, parseInt(maxTotalPages), parseInt(maxDepth));
    isFinished ? (req.finished = true) : (req.finished = false);

    next();
  } catch (e) {
    res.send({
      status: 500,
      message: "someting went wrong",
    });
  }
};

module.exports = {
  checkIfCrawlDoneRedis,
};
