const AWS = require("aws-sdk");

const sqs = new AWS.SQS({
  apiVersion: "2012-11-05",
  region: process.env.AWS_REGION,
});

const sendRootUrlToQueue = async ({ url, QueueUrl, workID }) => {
  let MessageBody = `${workID}$${url}$null$0`;
  try {
    if (QueueUrl) {
      const { MessageId } = await sqs
        .sendMessage({
          QueueUrl,
          MessageBody,
        })
        .promise();

      return MessageId;
    }
  } catch (err) {
    console.log("113", err);
  }
};

const deleteQueue = async ({ QueueUrl }) => {
  let isQueueDeleted;
  try {
    if (QueueUrl) isQueueDeleted = await sqs.deleteQueue({ QueueUrl }).promise();
    console.log("isQueueDeleted", isQueueDeleted);
  } catch (err) {
    console.log("112", err);
  }
};

module.exports = {
  sendRootUrlToQueue,
  deleteQueue,
};
