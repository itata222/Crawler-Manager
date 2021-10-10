const AWS=require('aws-sdk');

const sqs = new AWS.SQS({
    apiVersion: '2012-11-05',
    region:process.env.AWS_REGION
});


const deleteQueue = async (req,res,next) => {
    const QueueUrl=req.query.QueueUrl
    try {
        await sqs.deleteQueue({ QueueUrl }).promise();

        next();
    } catch (err) {
        console.log('111',err);
    }
};

const createQueue = async (req,res,next) => {
    try {
        const { QueueUrl } = await sqs.createQueue({ QueueName:'Crawler-Queue1' }).promise();
        req.QueueUrl = QueueUrl ;
        next();
    } catch (err) {
        console.log('111',err);
    }
};

module.exports={
    deleteQueue,
    createQueue
}