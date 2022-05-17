const path = require("path");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "labeler-core.commonjs2.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      name: "Labeler",
      type: "commonjs2"
    },
  },
};