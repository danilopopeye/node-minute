/**
 * Module dependencies.
 */

var
	express = require('express'),
	app = express.createServer(),
	mongoose = require('mongoose'),
	spawn = require('child_process').spawn,

/**
 * Mongoose models
 */

	Models = require('./lib/models')(mongoose),

/**
 * Minute main app
 */

	Minute = require('./lib/minute');

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	// app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.favicon());
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/public' }));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));

	console.log('Global configuration loaded');
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

/**
 * Connect to database
 */

mongoose.connect( process.env.MONGODB );

// Wait for connection before bind
mongoose.connection.on('open', function(){
	exports = new Minute( app, Models );
});
