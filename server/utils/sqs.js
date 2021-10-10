const AWS=require('aws-sdk');

const sqs = new AWS.SQS({
    apiVersion: '2012-11-05',
    region:process.env.AWS_REGION
});

const sendMessageToQueue = async ({url,rootUrl,QueueUrl}) => {
    let MessageBody = `${rootUrl}$$$${url}`;
    try {
        const {MessageId} = await sqs.sendMessage({
            QueueUrl,
            MessageBody
        }).promise();

        return MessageId;
    } catch (err) {
        console.log('111',err);
    }
};


const pollMessagesFromQueue = async ({ QueueUrl }) => {
    try {
        const { Messages } = await sqs.receiveMessage({
            QueueUrl,
            MaxNumberOfMessages: 10,
            MessageAttributeNames: [
                "All"
            ],
            VisibilityTimeout: 30,
            WaitTimeSeconds: 10
        }).promise();

        req.messages = Messages || [];

        if (Messages) {
            const messagesDeleteFuncs = Messages.map(message => {
                return sqs.deleteMessage({
                    QueueUrl,
                    ReceiptHandle: message.ReceiptHandle
                }).promise();
            });

            Promise.allSettled(messagesDeleteFuncs)
                .then(data => console.log(data));
        }
    } catch (err) {
        console.log(err);
    }
};

module.exports={
    sendMessageToQueue,
    pollMessagesFromQueue
}