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


module.exports={
    sendWorkPropertiesToRedis
}