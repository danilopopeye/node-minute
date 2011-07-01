
/**
 * Module dependencies.
 */

var
	express = require('express'),
	app = express.createServer(),
	mongoose = require('mongoose'),

/**
 * Mongoose models
 */

	M = require('./lib/models')(mongoose);

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger());
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
	app.set('mongo','mongodb://localhost/minute');
	app.set('port', 3000);

	console.log('Development configuration loaded');
});

app.configure('production', function(){
	app.use(express.errorHandler());
	app.set('mongo','mongodb://localhost/minute');
	app.set('port', 80);

	console.log('Production configuration loaded');
});

app.configure('dotcloud', function(){
	app.use(express.errorHandler());
	app.set('mongo','mongodb://localhost/minute');
	app.set('port', 8080);

	console.log('DotCloud configuration loaded');
});

// Routes

app.get('/', function(req, res){
	// TODO: 2 find() or find() and map() ?
	M.Match.find({ active: true }, function(err, actives){
		M.Match.find({ active: false }, function(err, inactives){
			res.render('index', {
				title: 'Matches list', locals: {
					active: actives, inactive: inactives
				}
			});
		});
	});
});

app.param('matchId', function(req, res, next, id){
	M.Match.findById(id, function(err, match){
		if (err) return next(err);
		if (!match) return next(new Error('failed to find match'));

		// save the match model
		req.match = match;

		next();
	});
});

app.get('/:matchId', function(req, res, next){
	var match = req.match, teams = {};

	teams[ match.home._id ] = {
		klass: 'left', index: 1
	};
	teams[ match.away._id ] = {
		klass: 'right', index: 2
	};

	res.render('game', {
		title: match.title, locals: {
			match: match, teams: teams
		}
	});
});

/**
 * Connect to database
 */

mongoose.connect( app.set('mongo') );

// Wait for connection before bind
mongoose.connection.on('open',function(){
	app.listen( app.set('port') );

	console.log("Express server listening on port %d", app.address().port);
});
