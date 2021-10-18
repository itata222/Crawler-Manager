const AWS=require('aws-sdk');

const sqs = new AWS.SQS({
    apiVersion: '2012-11-05',
    region:process.env.AWS_REGION
});


const deleteQueue = async (req,res,next) => {
    const QueueUrl=req.query.QueueUrl;
    let isQueueDeleted;
    try {
        if(QueueUrl)
            isQueueDeleted= await sqs.deleteQueue({ QueueUrl }).promise();
        console.log('isQueueDeleted',isQueueDeleted)
        next();
    } catch (err) {
        next(err)
        console.log('112',err);
    }
};

const createQueue = async (req,res,next) => {
    try {
        const { QueueUrl } = await sqs.createQueue({ QueueName:'Crawler-Queue1' }).promise();
        req.QueueUrl = QueueUrl ;
        req.QueueName='Crawler-Queue1'
        next();
    } catch (err) {
        console.log('111',err);
    }
};

module.exports={
    deleteQueue,
    createQueue
}