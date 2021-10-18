const AWS=require('aws-sdk');

const sqs = new AWS.SQS({
    apiVersion: '2012-11-05',
    region:process.env.AWS_REGION
});

const sendRootUrlToQueue = async ({url,rootUrl,QueueUrl}) => {
    let MessageBody = `${rootUrl}$${url}$${rootUrl}`;
    try {
        if(QueueUrl){
            const {MessageId} = await sqs.sendMessage({
                QueueUrl,
                MessageBody
            }).promise();
    
            return MessageId;
        }
    } catch (err) {
        console.log('113',err);
    }
};


module.exports={
    sendRootUrlToQueue
}