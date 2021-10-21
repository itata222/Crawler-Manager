const redisClient = require("../db/redis");

const sendWorkPropertiesToRedis = async ({ rootUrl, maxDepth, maxTotalPages, finished, workID }) => {
  const workProperties = { rootUrl, maxDepth, maxTotalPages, finished, workID };
  try {
    await redisClient.hmsetAsync(`workDict-${workID}`, workProperties);
    await redisClient.expireAsync(`workDict-${workID}`, 300);

    const workDict = await redisClient.hgetallAsync(`workDict-${workID}`);

    return workDict;
  } catch (e) {
    return e;
  }
};

const initCurrentLevelDataInRedis = async (workID) => {
  const levelData = {
    currentLevel: 0,
    urlsInCurrentLevelToScan: 1,
    urlsInNextLevelToScan: 0,
    urlsInCurrentLevelAlreadyScanned: 0,
    totalUrls: 0,
    currentLevelDeathEnds: 0,
  };
  try {
    await redisClient.hmsetAsync(`levelData-${workID}`, levelData);
    await redisClient.expireAsync(`levelData-${workID}`, 300);
  } catch (e) {
    return e;
  }
};

const getAllUrlsInRedis = async ({ workID, maxPages }) => {
  try {
    const response = await redisClient.keysAsync(`*`);
    let urlsAsObjs = [];
    let aaa = 0;
    for (let i = 0, j = 0; i < response.length; i++) {
      const responseValueType = await redisClient.typeAsync(response[i]);
      if (responseValueType === "string") {
        j++;
        const responseValue = await redisClient.getAsync(response[i]);
        const currentUrlInRedis = JSON.parse(responseValue);
        console.log(currentUrlInRedis.myAddress, currentUrlInRedis.workID);
        if (currentUrlInRedis.workID === workID && aaa < parseInt(maxPages)) {
          aaa++;
          urlsAsObjs.push(responseValue);
        }
      }
    }
    console.log("jaaa", aaa, workID);
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
