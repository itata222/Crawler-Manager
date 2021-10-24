const AWS = require("aws-sdk");

const sqs = new AWS.SQS({
  apiVersion: "2012-11-05",
  region: process.env.AWS_REGION,
});

const createQueue = async (req, res, next) => {
  try {
    const { QueueUrl } = await sqs.createQueue({ QueueName: "Crawler-Queue1" }).promise();
    req.QueueUrl = QueueUrl;
    req.QueueName = "Crawler-Queue1";
    next();
  } catch (err) {
    console.log("111", err.message || err.Message);
  }
};

module.exports = {
  createQueue,
};
