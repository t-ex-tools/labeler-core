const path = require("path");

module.exports = (env) => {

  let moduleConfig = {
    output: {
      filename: "labeler-core.module.js",
      path: path.resolve(__dirname, "dist"),
      library: {
        name: "Labeler",
        type: "commonjs2"
      },
    }
  };
  
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
  
  let config = {
    entry: "./src/index.js",
    mode: "production",
  };

  return [
    Object.assign({ ...config }, moduleConfig),
    Object.assign({ ...config }, varConfig),
  ];

};