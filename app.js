
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
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/public' }));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
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

app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
