
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const webpackCompiler = webpack(webpackConfig);
const webpackMiddlewareFactory = require("webpack-dev-middleware");

module.exports = webpackMiddlewareFactory(
  webpackCompiler,
  {
    noInfo: false,
    lazy: true, // wont work with bundles...
    publicPath: '/',
    stats: {colors: true}
  }
);
