const path = require("path");
const fs = require("fs");

module.exports = (env) => {

  let moduleConfig = {
    output: {
      filename: "labeler-core.module.js",
      path: path.resolve(__dirname, "dist"),
      library: {
        name: "Labeler",
        type: "commonjs2"
      }
    }
  };

  let nodeConfig = Object.assign({ target: "node" }, moduleConfig);
  nodeConfig.output.filename = "labeler-core.node.js";
  
  let varConfig = {
    output: {
      filename: "labeler-core.var.js",
      path: path.resolve(__dirname, "dist"),
      library: {
        name: "Labeler",
        type: "var"
      },
    },
  };
  
  env.mode = (env.mode) ? env.mode : "development";

  let config = {
    entry: "./src/index.js",
    mode: env.mode,
    devtool: 'inline-source-map',
    optimization: {
      minimize: (env.mode === "production")
    },
    resolve: {
      fallback: {
        fs: false
      }
    }
  };

  return [
    Object.assign({ ...config }, moduleConfig),
    Object.assign({ ...config }, varConfig),
    Object.assign({ ...config }, nodeConfig),
  ];

};