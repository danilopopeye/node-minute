/**
 * Required modules
 */

var
	fs = require('fs'),
	spawn = require('child_process').spawn;

/**
 * Load.js
 * @param {Array} filenames
 * @constructor
 */

function Load( files ){
	var self = this;

	this.file = files[0];

	this.run();

	files.forEach(function( file ){
		self.watch( file );
	});

	process.on('exit', function(){
		self.app.kill();
	});
}

/**
 * Watch the specified file
 * @param {String} filename
 */

Load.prototype.watch = function( file ){
	var self = this;

	fs.watchFile(file, function(){
		self.reload();
	});
};

/**
 * Spawn the script
 */

Load.prototype.run = function(){
	var self = this;

	// fork it
	this.app = spawn( process.execPath, [ this.file ] );

	// pipe the str{out, err}
	[ 'stdout', 'stderr' ].forEach(function( std ){
		self.app[ std ].on('data', function( data ){
			process[ std ].write( data );
		});
	});

	// log the app exits
	this.app.on('exit', function( code, signal ){
		console.log( '\n', self.date(), self.file, 'process exited', '\n' );
	});
};

/**
 * Reload the app
 */

Load.prototype.reload = function(){
	this.app.kill('SIGINT');
	this.run();
};

/**
 * Format the date
 */

Load.prototype.date = function(){
	var d = new Date();

	return [
		d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()
	].join(':');
};

/**
 * Execute or show error message
 */

if( process.argv.length > 1 ){
	exports = new Load( process.argv.slice(2) );
} else {
	console.error('Expected the script to run\nEx: node load.js script.js another_to_watch.js');
	exit(1);
}
