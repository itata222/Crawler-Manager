const { sendWorkPropertiesToRedis, setWorkAsDoneInRedis, setCurrentLevelDataInRedis, getAllUrlsInRedis } = require("../utils/redis");
const { pollMessagesFromQueue, sendMessageToQueue } = require("../utils/sqs");
const Axios=require('axios');
const Tree = require("../utils/tree");

let tree;
let maxPages;
let maxiDepth;

// const getUrl = async (req, res) => {
//     try {
//         let done=false;
//         const url=req.body.url;
//         tree.insert(url);
//         const treeAsArray= tree.bfsTraveres();
//         if(treeAsArray.length>=maxPages){
//             const updatedWorkDictioneryInRedis= await setWorkAsDoneInRedis();
//             console.log('done',updatedWorkDictioneryInRedis)
//             done=true;
//         }
//         res.send({done})
//     } catch (error) {
//        console.log(error)
//     }
// }

const getTree = async (req, res) => {
    try {
        const allUrls = await getAllUrlsInRedis();
        console.log('all',allUrls)
        const treeAsArray= tree.bfsTraveres();
        res.send(treeAsArray)
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
    const QueueName=req.QueueName;
    const finished= false;
    let port=8000;
    const url=`http://localhost:${port}`;
    try {
        res.send({QueueUrl});
        tree = new Tree();
        maxPages=maxTotalPages;
        maxiDepth=maxDepth;
        await sendMessageToQueue({url:rootUrl,rootUrl,QueueUrl});
        await sendWorkPropertiesToRedis({rootUrl,maxDepth,maxTotalPages,finished})
        await setCurrentLevelDataInRedis();
        await Axios.post(url + "/crawl", {rootUrl,QueueName,maxiDepth,maxPages});
        // port++;
        // await Axios.post(url + "/crawl", {rootUrl,QueueName});
        // port++;
    } catch (error) {
        console.log('err1',error)
    }
}

module.exports={
    getTree,
    startManager,
    // getUrl
}