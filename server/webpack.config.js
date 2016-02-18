"use strict";
/* jshint node:true, es3:false */
/* eslint-env node */

const webpack = require('webpack');
const definePlugin = new webpack.DefinePlugin({
	'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
	'process.env.SOURCE_VERSION': `'${process.env.SOURCE_VERSION}'`
});

module.exports = {
	context: __dirname,
	entry: {
		index: ['../client']
	},
	plugins: [
		definePlugin
	],
	output: {
		path: '/build/js',
		filename: '[name].bundle.js',
		chunkFilename: '[id].bundle.js'
	},
	module: {
		loaders: [
			{test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader" },
			{test: /\.json$/, loader: 'json-loader'}
		]
	},
	devtool: '#source-map',
	resolve: {
		extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"],
		// alias: {
		// 	'es6-promise' : 'when'
		// }
	},
	externals: { }
};
