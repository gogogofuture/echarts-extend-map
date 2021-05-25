import axios from "axios";

// 判定是否为 echarts-extend-map 的地图名（形如 110000/110000_full, 6位数/6位数字拼接“_full”）
const isEcharsExtendMapRegx = /^\d{6}$|(?:_full)$/;

export default function(echarts) {
  // 动态地图加载
  const init = echarts.init
  echarts.init = function(...argv) {
    const instance = init.apply(this, argv);
    const setOption = instance.setOption;
    instance.setOption = (option = {}, ...argv) => {
      // 收集使用到的地图
      const maps = collectMaps(option)
      if (isMapsRegister(echarts, maps)) {
        setOption.apply(instance, [option, ...argv]);
      }
      else {
        loadMap(echarts, maps).then(() => {
          setOption.apply(instance, [option, ...argv]);
        })
      }
      return instance;
    }
    return instance;
  }
}

function collectMaps({geo, series, options}) {
  let maps = [];
  if (geo && geo.map) {
    maps.push(geo.map);
  }
  if (series) {
    series.forEach((serie) => {
      if (serie.type === "map") {
        maps.push(serie.map);
      }
    })
  }

  if (options) {
    options.forEach((option) => {
      maps.push(...collectMaps(option))
    })
  }

  maps.filter((map) => {
    return isEcharsExtendMapRegx.test(map)
  })
  maps = [...new Set(maps)];
  return maps;
}

function isMapsRegister(echarts, maps) {
  return maps.every((map) => {
    return echarts.getMap(map)
  })
}

function getMapGeoJson(map) {
  const url = `/geoJson/${map}.json`;

  return axios.get(url).then(v => {
    const xml = v.request;
    let ret;
    try {
      ret = JSON.parse(xml.responseText);
    } catch (e) {
      throw new Error(`uri: ${url}, JSON 文件解析失败，请检查该Json文件格式`);
    }
    return ret;
  });
}

function loadMap(echarts, maps) {
  const promises = [];
  maps.forEach(map => {
    if (!echarts.getMap(map)) {
      promises.push(getMapGeoJson(map));
    }
  })
  return Promise.all(promises).then((mapJsons) => {
    maps.forEach((map, i) => {
      echarts.registerMap(map, mapJsons[i]);
    })
  })
}
