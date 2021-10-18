const redisClient = require('../db/redis');

const sendWorkPropertiesToRedis=(async({rootUrl,maxDepth,maxTotalPages,finished})=>{
    const workProperties={rootUrl,maxDepth,maxTotalPages,finished,totalUrls:0}
    try {        
        await redisClient.hmsetAsync("workDict", workProperties)

        const workDict= await redisClient.hgetallAsync("workDict");

        return workDict
    } catch (e) {
        return e;
    }
})

const initCurrentLevelDataInRedis=(async()=>{
    const levelData={
        currentLevel:0,
        urlsInCurrentLevelToScan:1,
        urlsInCurrentLevelAlreadyScanned:0,
    }
    try {        
        await redisClient.hmsetAsync("levelData", levelData)

    } catch (e) {
        return e;
    }
})

const getAllUrlsInRedis=(async({missionRoot})=>{
    console.log(missionRoot)
    try {
        const response=await redisClient.keysAsync(`*${missionRoot}*`)
        let urlsAsObjs=[];
        for(let key of response)
            urlsAsObjs.push(await redisClient.getAsync(key))
        return urlsAsObjs;
    } catch (e) {
        console.log('e',e)
    }
})


module.exports={
    sendWorkPropertiesToRedis,
    getAllUrlsInRedis,
    initCurrentLevelDataInRedis
}