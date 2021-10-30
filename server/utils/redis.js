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

const initCurrentLevelDataInRedis = async (workID, maxPages) => {
  const levelData = {
    currentLevel: 0,
    urlsInCurrentLevelToScan: 1,
    urlsInNextLevelToScan: 0,
    remainingSlots: parseInt(maxPages),
    urlsInCurrentLevelAlreadyScanned: 0,
    totalUrls: 0,
    currentLevelDeathEnds: 0,
    firstPositionInNextLevel: 1,
  };
  try {
    await redisClient.hmsetAsync(`levelData-${workID}`, levelData);
  } catch (e) {
    return e;
  }
};

const getLatestDataFromRedis = async ({ workID }) => {
  try {
    const treeArr = [];
    const tree = await redisClient.lrangeAsync(`tree:${workID}`, 0, -1);
    tree.forEach((element) => {
      const el = JSON.parse(element);
      treeArr.push(...el);
    });
    return treeArr;
  } catch (e) {
    console.log("e", e);
  }
};
const pushRootUrlNodeToTreeListInRedis = async (workID, rootNode) => {
  const rootNodeStr = JSON.stringify([rootNode]);
  await redisClient.lpushAsync(`tree:${workID}`, rootNodeStr);
};

const getAllUrlsInRedis = async ({ workID }) => {
  try {
    const response = await redisClient.keysAsync(`*`);
    let urlsAsObjs = [];
    for (let i = 0, j = 0, a = 0; i < response.length; i++) {
      const responseValueType = await redisClient.typeAsync(response[i]);
      if (responseValueType === "string") {
        j++;
        const responseValue = await redisClient.getAsync(response[i]);
        const currentUrlInRedis = JSON.parse(responseValue);
        // console.log("getall", workID, currentUrlInRedis.workID);
        if (currentUrlInRedis.workID === workID) {
          a++;
          urlsAsObjs.push(currentUrlInRedis);
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
    const currentLevelData = await getCurrentLevelData(workID);
    // console.log(parseInt(currentLevelData.totalUrls), parseInt(maxTotalPages));
    // console.log(parseInt(currentLevelData.remainingSlots), parseInt(currentLevelData.currentLevelDeathEnds));
    // console.log(
    //   parseInt(currentLevelData.currentLevel),
    //   parseInt(maxDepth),
    //   parseInt(currentLevelData.urlsInCurrentLevelAlreadyScanned),
    //   parseInt(currentLevelData.currentLevelDeathEnds),
    //   parseInt(currentLevelData.urlsInCurrentLevelToScan)
    // );
    if (
      parseInt(currentLevelData.totalUrls) >= parseInt(maxTotalPages) ||
      parseInt(currentLevelData.remainingSlots) - parseInt(currentLevelData.currentLevelDeathEnds) <= 0 ||
      (parseInt(currentLevelData.currentLevel) >= parseInt(maxDepth) &&
        parseInt(currentLevelData.urlsInCurrentLevelAlreadyScanned) + parseInt(currentLevelData.currentLevelDeathEnds) >=
          parseInt(currentLevelData.urlsInCurrentLevelToScan))
    ) {
      console.log("redis-utils-doneeeeeeeeeeeeeeeeeeeeeee");
      await deleteQueue({ QueueUrl });
      return true;
    } else return false;
  } catch (error) {
    console.log("eeeeeer123", error);
  }
};

module.exports = {
  sendWorkPropertiesToRedis,
  pushRootUrlNodeToTreeListInRedis,
  getAllUrlsInRedis,
  getLatestDataFromRedis,
  initCurrentLevelDataInRedis,
  checkIsWorkDone,
  getCurrentLevelData,
};
