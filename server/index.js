/* jshint node:true, es3:false */
/* eslint no-console:0 */
/* eslint-env node */
"use strict";
require("babel-core/register")({
  "presets": ["react", "es2015-node4"],
	"plugins": [
		"transform-object-rest-spread",
		"transform-es2015-modules-commonjs",
		"syntax-object-rest-spread"
	]
});
require('./app');
