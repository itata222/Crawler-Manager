const redisClient = require("../db/redis");

const sendWorkPropertiesToRedis = async ({ rootUrl, maxDepth, maxTotalPages, finished, workID }) => {
  const workProperties = { rootUrl, maxDepth, maxTotalPages, finished, workID };
  try {
    await redisClient.hmsetAsync("workDict", workProperties);

    const workDict = await redisClient.hgetallAsync("workDict");

    return workDict;
  } catch (e) {
    return e;
  }
};

const initCurrentLevelDataInRedis = async () => {
  const levelData = {
    currentLevel: 0,
    urlsInCurrentLevelToScan: 1,
    urlsInNextLevelToScan: 0,
    urlsInCurrentLevelAlreadyScanned: 0,
    totalUrls: 0,
    totalDeathEnds: 0,
  };
  try {
    await redisClient.hmsetAsync("levelData", levelData);
  } catch (e) {
    return e;
  }
};

const getAllUrlsInRedis = async ({ workID, maxPages }) => {
  try {
    const response = await redisClient.keysAsync(`*`);
    let urlsAsObjs = [];
    for (let i = 0; i < Math.min(parseInt(maxPages), response.length); i++) {
      const currentUrlInRedis = JSON.parse(response[i]);
      console.log(currentUrlInRedis);
      if (response[i].includes("http") && currentUrlInRedis.workID === workID) {
        urlsAsObjs.push(await redisClient.getAsync(response[i]));
      }
    }
    return urlsAsObjs;
  } catch (e) {
    console.log("e", e);
  }
};

module.exports = {
  sendWorkPropertiesToRedis,
  getAllUrlsInRedis,
  initCurrentLevelDataInRedis,
};
