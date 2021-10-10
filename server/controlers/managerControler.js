const { sendWorkPropertiesToRedis } = require("../utils/redis");
const { pollMessagesFromQueue, sendMessageToQueue } = require("../utils/sqs");
const Tree = require("../utils/tree");

const getTree = async (req, res) => {
    try {
        const fakeTree={};
        res.send({tree:JSON.stringify(fakeTree)});
        
    } catch (error) {
        res.status(500).send({
            status:500,
            message:'Manager failed to send tree'
        })
    }
}

const startManager = async (req, res) => {
    const {rootUrl,maxDepth,maxTotalPages}=req.body;
    const QueueUrl=req.QueueUrl;
    const finished= false;
    try {
        res.send({QueueUrl});
        const tree = new Tree();
        const messageIdSqs=await sendMessageToQueue({url:rootUrl,rootUrl,QueueUrl});
        const workPropertiesMessageResponse= await sendWorkPropertiesToRedis({rootUrl,maxDepth,maxTotalPages,finished})
        console.log(tree,messageIdSqs,workPropertiesMessageResponse)
    } catch (error) {
        console.log(error)
    }
}

module.exports={
    getTree,
    startManager
}