var
	spawn = require('child_process').spawn;

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
	});
}

Games.prototype.__defineGetter__('env', function(){
	if( !this._env ){
		this._env = config[ process.env.NODE_ENV || 'development' ];
	}

	return this._env;
});

Games.prototype.run = function( i ){
	var app, self = this;

  app = spawn(
		process.execPath, [ __dirname + '/lib/faker.js' ]
	);

	console.log( i + ':Game spawned' );

	[ 'stdout', 'stderr' ].forEach(function( std ){
		app[ std ].on('data', function( data ){
			process[ std ].write( i +':'+ data.toString() );
		});
	});

	app.on('exit', function( code, signal ){
		console.log( i + ':Game exited' );

		// restart on next loop
		process.nextTick(function(){
			// self.run( i );
		});
	});

	this.apps[ i ] = app;
};

exports = new Games( process.argv[2] || 3 );
