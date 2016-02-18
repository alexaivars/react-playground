// if(process.env.KIBANA_ENABLED) { require('svtlib-js-logger')(); }

const throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const debug = require('debug')('svtse:index:debug');
const cluster = require('cluster');



function start() {
	debug('starting worker %s', (cluster.worker || { id:'single' }).id);
	require('./worker');
	process.on('SIGTERM', () => {
		debug('exited worker %s', (cluster.worker || { id:'single' }).id);
	});
}

function clone() {
	if(WORKERS > 1) {
		throng(start, {
			workers: WORKERS,
			lifetime: Infinity
		});
	} else {
		start();
	}
}

clone();
