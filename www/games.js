var fs = require('fs'), spawn = require('child_process').spawn;

function Games( n ){
	var self = this;

	// this will change on 0.5
	this.apps = [];

	for( var i = 0; i < n; i++ ){
		this.run( i );
	}

	process.on('SIGINT', function(){
		self.apps.forEach(function(app){
			console.log( i + ':Game terminated' );
			app.kill('SIGINT');
		});

		process.exit();
	});
}

Games.prototype.__defineGetter__('env', function(){
	if( !this._env ){
		var config = fs.readFileSync('./config.json');
		this._env = config[ process.env.NODE_ENV || 'development' ];
	}

	return this._env;
});

Games.prototype.run = function( i ){
	var self = this, app = spawn(
		process.execPath, [ __dirname + '/lib/faker.js' ], {
			env: this.env
		}
	);

	console.log( i + ':Game spawned' );

	[ 'stdout', 'stderr' ].forEach(function( std ){
		app[ std ].once('data', function( data ){
			process[ std ].write( i +':'+ data.toString() );
		});
	});

	app.on('exit', function( code, signal ){
		console.log( i + ':Game exited' );

		// restart on next loop
		process.nextTick(function(){
			self.run( i );
		});
	});

	this.apps[ i ] = app;
};

exports = new Games( process.argv[2] || 3 );
