
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var M = require('./faker/lib/models');

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
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.listen(3000);
});

app.configure('production', function(){
	app.use(express.errorHandler());
	app.listen(80);
});

// Routes

app.get('/', function(req, res){
	// TODO: 2 find() or find() and map() ?
	M.Matches.find({ active: true }, function(err, actives){
		M.Matches.find({ active: false }, function(err, inactives){
			res.render('index', {
				title: 'Matches list', locals: {
					active: actives, inactive: inactives
				}
			});
		});
	});
});

app.param('matchId', function(req, res, next, id){
	M.Matches.findById(id, function(err, match){
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

console.log("Express server listening on port %d", app.address().port);
