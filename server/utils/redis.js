const redisClient = require('../db/redis');

const sendWorkPropertiesToRedis=(async({rootUrl,maxDepth,maxTotalPages,finished})=>{
    const workProperties={rootUrl,maxDepth,maxTotalPages,finished}
    try {        
        await redisClient.hmsetAsync("workDict", workProperties)

        const workDict= await redisClient.hgetallAsync("workDict");

        return workDict
    } catch (e) {
        return e;
    }
})

const setCurrentLevelDataInRedis=(async()=>{
    const levelData={
        level:0,
        childs:0
    }
    try {        
        await redisClient.hmsetAsync("levelData", levelData)

    } catch (e) {
        return e;
    }
})

const getAllUrlsInRedis=(async()=>{
    try {
        const response=await redisClient.keysAsync('http*')
        return response;
    } catch (e) {
        console.log('e',e)
    }
})

const setWorkAsDoneInRedis=(async()=>{
    try {        
        await redisClient.hsetAsync('workDict','finished','true')

        const workDict= await redisClient.hgetallAsync("workDict");

        return workDict;
    } catch (e) {
        return e;
    }
})


module.exports={
    sendWorkPropertiesToRedis,
    getAllUrlsInRedis,
    setWorkAsDoneInRedis,
    setCurrentLevelDataInRedis
}