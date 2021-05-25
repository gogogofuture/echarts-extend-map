const superagent = require("superagent");
const cheerio = require("cheerio");
const log4js = require("log4js");

const fs = require("fs");
const util = require("util");

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    access_log: { type: 'file', filename: 'log/access_log.log' },
    error_log: { type: 'file', level: "error", filename: 'log/error_log.log' }
  },
  categories: {
    default: { appenders: ['out', 'access_log', "error_log"], level: 'all' }
  }
})
const logger = log4js.getLogger("crawler");
logger.level = "ALL";

// 爬取的数据存放目录
const targetDir = "geoJson";

// 中华人民共和国民政部官网 - 2020年11月份县以上行政区划代码
const chinaAdcodeURL = "http://preview.www.mca.gov.cn/article/sj/xzqh/2020/2020/202101041104.html";

// 阿里云 datav 地图开放区域数据 http://datav.aliyun.com/tools/atlas/#&lat=30.332329214580188&lng=106.72278672066881&zoom=3.5
const datavURL = "https://geo.datav.aliyun.com/areas_v2/bound/";

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time * 1e3)
  })
}

async function getAdcode() {
  // 获取页面 html 内容字符串
  const res = await superagent.get(chinaAdcodeURL);

  logger.info("获取县以上行政区划代码页面数据成功");

  const $ = cheerio.load(res.text);

  const result = [
    [100000, "中华人民共和国"]
  ];
  $("table tbody tr").each((i, ele) => {
    const [adcode, name] = $(ele).text().trim().split(/\s+/);
    if (adcode.length === 6 && !isNaN(+adcode)) {
      result.push([+adcode, name])
    }
  })
  return result;
}

const fsWriteFile = util.promisify(fs.writeFile);

async function writeJsonFile(filename) {
  try {
    const res = await superagent.get(`${datavURL}${filename}`);
    await fsWriteFile(`${targetDir}/${filename}`, res.text)
  }
  catch (e) {
    if (e.status === 404 && filename.includes("_full")) {
      logger.info(filename + "不存在");
    }
    else {
      logger.error(filename + "写入失败！ 原因：" + JSON.stringify(e))
    }
  }
}

async function writeDataVGeoJsonFile() {
  const administratives = await getAdcode();

  // 判断文件夹是否存在不存在创建一个
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir)
  }

  for (const [adcode, name] of administratives) {
    const filenames = [`${adcode}.json`, `${adcode}_full.json`]

    for (const filename of filenames) {
      await writeJsonFile(filename)
    }

    logger.info(name + "|" + adcode + "json数据写入结束！")

    await sleep(0.2);
  }
}

// 组装省市区/县数据
// function combine(data) {
//   const [a, b, c, d, e, f] = adcode.toString().split("");
//   const provice = a + b;
//   const city = c + d;
//   const district = e + f;
// }

async function start() {
  try {
    await writeDataVGeoJsonFile();

    logger.info("json数据写入结束！")
  }
  catch (e) {
    logger.error("json数据写入失败！")
  }
}

// 总数据量在3000多条,耗时大约在10min左右
start();
