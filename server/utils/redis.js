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
  };
  try {
    await redisClient.hmsetAsync(`levelData-${workID}`, levelData);
  } catch (e) {
    return e;
  }
};

const getAndSetWorkID = async () => {
  try {
    const a = await redisClient.lpushAsync("workIDNumber", 1);
    const workID = await redisClient.lrangeAsync("workIDNumber", 0, -1);
    return workID.length;
  } catch (error) {
    console.log(error);
  }
};

const getLatestDataFromRedis = async ({ workID }) => {
  try {
    const treeArr = [];
    const tree = await redisClient.lrangeAsync(`tree:${workID}`, 0, -1);
    tree.forEach((element) => {
      const el = JSON.parse(element);
      for (let item of el) {
        if (item != null) treeArr.push(item);
      }
    });
    const sortedTreeArr = treeArr.sort(function (a, b) {
      if (typeof a.position !== "number") a.position = `${a.position}`;
      if (typeof b.position !== "number") b.position = `${b.position}`;
      const aPos = a.position.split("-");
      const bPos = b.position.split("-");
      for (let i = 0; i < aPos.length; i++) {
        if (aPos.length < bPos.length) return -1;
        if (aPos.length > bPos.length) return 1;
        if (parseInt(aPos[i]) < parseInt(bPos[i])) return -1;
        if (parseInt(aPos[i]) > parseInt(bPos[i])) return 1;
        continue;
      }
      return 0;
    });
    return sortedTreeArr;
  } catch (e) {
    console.log("e", e);
  }
};
const pushRootUrlNodeToTreeListInRedis = async (workID, rootNode) => {
  const rootNodeStr = JSON.stringify([rootNode]);
  await redisClient.lpushAsync(`tree:${workID}`, rootNodeStr);
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

// const isUrlAlreadyInRedis = async (url) => {
//   try {
//     let isExist = false;
//     const response = await redisClient.keysAsync("*");
//     if (response.includes(url)) isExist = true;
//     return isExist;
//   } catch (e) {
//     console.log("e", e);
//   }
// };

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
  getLatestDataFromRedis,
  initCurrentLevelDataInRedis,
  checkIsWorkDone,
  getCurrentLevelData,
  getAndSetWorkID,
};
