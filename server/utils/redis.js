const redisClient = require("../db/redis");
const { deleteQueue } = require("./sqs");

const sendWorkPropertiesToRedis = async ({ rootUrl, maxDepth, maxTotalPages, finished, workID }) => {
  const workProperties = { rootUrl, maxDepth, maxTotalPages, finished, workID };
  try {
    await redisClient.hmsetAsync(`workDict-${workID}`, workProperties);

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
        if (currentUrlInRedis.workID === workID && aaa < parseInt(maxPages)) {
          aaa++;
          urlsAsObjs.push(responseValue);
        }
      }
    }
    return urlsAsObjs;
  } catch (e) {
    console.log("e", e);
  }
};

const getCurrentLevelData = async (workID) => {
  try {
    const response = await redisClient.hgetallAsync(`levelData-${workID}`);
    return response;
  } catch (e) {
    console.log(e);
    return e;
  }
};

const checkIsWorkDone = async (QueueUrl, workID, maxTotalPages, maxDepth) => {
  try {
    console.log("redis-utils-workID", workID);
    const currentLevelData = await getCurrentLevelData(workID);

    console.log(
      parseInt(currentLevelData.totalUrls),
      parseInt(maxTotalPages),
      parseInt(maxDepth),
      parseInt(currentLevelData.currentLevel),
      parseInt(currentLevelData.urlsInCurrentLevelAlreadyScanned) + 1 + parseInt(currentLevelData.currentLevelDeathEnds),
      parseInt(currentLevelData.urlsInCurrentLevelToScan)
    );
    if (
      parseInt(currentLevelData.totalUrls) >= parseInt(maxTotalPages) ||
      (parseInt(maxDepth) >= parseInt(currentLevelData.currentLevel) &&
        parseInt(currentLevelData.urlsInCurrentLevelAlreadyScanned) + 1 + parseInt(currentLevelData.currentLevelDeathEnds) >=
          parseInt(currentLevelData.urlsInCurrentLevelToScan))
    ) {
      console.log("doneeeeeeeeeeeeeeeeeeeeeee");
      await deleteQueue({ QueueUrl });
      return true;
    } else return false;
  } catch (error) {
    console.log("eeeeeer123", error);
  }
};

module.exports = {
  sendWorkPropertiesToRedis,
  getAllUrlsInRedis,
  initCurrentLevelDataInRedis,
  checkIsWorkDone,
};
