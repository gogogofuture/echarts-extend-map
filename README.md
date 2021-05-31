## echarts 离线地图扩展

### 关于 echarts 引入说明

### 功能：

- 对`echarts`进行了扩展，可以直接通过行政区划代码（[各省份行政区划代码](http://preview.www.mca.gov.cn/article/sj/xzqh/2020/2020/202101041104.html)）设置地图.无需手动加载。
- 中国、省、市、区级别的所有的区域轮廓离线 JSON 数据（数据来源：[阿里云-datav](http://datav.aliyun.com/tools/atlas/#&lat=30.332329214580188&lng=106.72278672066881&zoom=3.5)）。

### 安装及使用说明
```
  npm install echarts-extend-map --save
```

#### step 1. webpack 插件引入

> 插件配置参数说明  
> `filenames` Array\<String\> 一个有字符串项组成的数组，每项字符串项支持 minimatch 匹配文件名称

```text
   minimatch说明:
   * 匹配任意数量的字符，但不匹配/
   ? 匹配单个字符，但不匹配/  
   ** 匹配任意数量的字符，包括/，只要它是路径中唯一的一部分  
   {} 允许使用一个逗号分割的列表或者表达式  
   ! 在模式的开头用于否定一个匹配模式(即排除与模式匹配的信息)
   
   e.g.
   "42*.json" 42开头的
   "11*.json" 11开头的
   "!42*.json" 除了42开头的
```


```
>> vue-cli
  {
    ...
    chainWebpack(config) {
      const CopyGeoJson2DistPlugin = require("echarts-extend-map/copyGeoJson2DistPlugin")
      config.plugin("echart-extend-map").use(CopyGeoJson2DistPlugin);
      // 只打包湖北省的数据和北京市的
      // config.plugin("echart-extend-map").use(CopyGeoJson2DistPlugin, [["42*.json", "11*.json"]]);
      // 只打包除了湖北省以外的
      // config.plugin("echart-extend-map").use(CopyGeoJson2DistPlugin, [["!42*.json"]]);
    },
    ...
  }

>> webpack
  const CopyGeoJson2DistPlugin = require("echarts-extend-map/copyGeoJson2DistPlugin")
  {
    ...
    plugins: [
      ...
      new CopyGeoJson2DistPlugin()
      // 只打包湖北省的数据和北京市的
      // new CopyGeoJson2DistPlugin(["42*.json", "11*.json"]));
      // 只打包除了湖北省以外的
      // new CopyGeoJson2DistPlugin(["!42*.json",]));
    ],
    ...
  }
```

#### step 2. 在代码中引入

```
// echarts 4.x 版本

// 1. 全局引入echarts: 通过script标签在 index.html 全局引入echarts

// 2. import echarts from "echarts";

// 关于echarts 5.x版本

// 仅支持全局引入echarts 通过script标签在 index.html 全局引入echarts

import extendEchartsMap from "echarts-extend-map";

extendEchartsMap(echarts);
```

#### step 3. 使用

**geo.map/serie.map，地图设置使用区划代码代码，e.g. `{map: "110000"}` `{map: "110000_full"}`, (值和 geoJson 下的 json 文件的名称一致)**

> 注意: 如果项目使用的还有其它的地图源数据注册地图时必须避免类似的命名，该扩展通过形似  "110000" "110000_full"的方式来判定加载相应地图数据。

所有数据存放在 echarts-extend-map/geoJson 文件夹下。 文件采用`行政区划代码`为 json 文件名，其中带有 `_full` 代表包含子级区域轮廓并且只有行政级别-区以上才有。以北京市为例 "110000.json","110000_full.json" 分别代表北京市轮廓和包含子级区域的北京市轮廓，具体效果参考 [阿里云-datav](http://datav.aliyun.com/tools/atlas/#&lat=30.332329214580188&lng=106.72278672066881&zoom=3.5)。

```
  // echarts 配置
  option: {
    geo: {
      map: "100000", // 中华人民共和国轮廓
      roam: true,
      label: {
        show: true
      }
    },
    series: [
      {
        name: "北京市"
        type: "map",
        map: "110000_full" // 北京市包含子区域划分的轮廓
      }
    ]

  // echart_instance.setOption(option)
</script>
```


### 关于 geoJSON 数据更新
```
 // 在当前目录下执行
 npm run crawler
```
