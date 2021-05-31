const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");

class CopyGeoJson2DistPlugin extends CopyPlugin {
  /**
   * 目的: 按项目需要打包离线地图数据
   * @param {Array} filenames 指定打包的文件名集合,为空则表示不限制
   * 说明：filnames集合 minimatch https://github.com/isaacs/minimatch
   * e.g
   *  ["11*.json", "42*.json"] 只打包北京市和湖北省
   *  ["!42*.json"] 打包除了湖北省以外的数据
   */
  constructor(filenames) {
    const context = path.resolve(__dirname);

    filenames = filenames || ["*.json"]

    const patterns = filenames.map((filename) => {
        return {
          from: "geoJson/" + filename,
          context
        };
      })
    super(patterns);
  }
}

module.exports = CopyGeoJson2DistPlugin;
