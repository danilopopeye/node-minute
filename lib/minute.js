/**
 * Module dependencies
 */

var
	socket_io = require('socket.io'),
	child = require('child_process'),
	redis = require('redis');

/**
 * Minute
 * @constructor
 * @param {Object} express app
 * @param {Object} mongoose models
 */

function Minute(app, models){
	var self = this;

	// socket.io namespaces
	this.matches = {};

	// external references
	this.app = app;
	this.models = models;

	// circular reference is ok?
	this.app.minute = this;

	// main app routes
	this.routes();

	// bind socket.io to express
	this._io = socket_io.listen( this.app );
	this.io = this._io.sockets;

	// socket binds
	this.listeners();

	// connect to redis
	this.redis = this.getRedis();

	this.redis.on('ready', function(){
		// redis PubSub subscriptions
		self.subscribes();

		// start the express app
		app.listen( process.env.PORT );

		console.log(
			"Express server listening on port %d in %s mode",
			process.env.PORT, app.settings.env
		);
	});
}

/**
 * Main app routes
 */

Minute.prototype.routes = function(){
	var self = this.models;

	this.app.param('matchId', function(req, res, next, id){
		self.Match.findById(id, function(err, match){
			if (err) return next(err);
			if (!match) return next(new Error('failed to find match'));

			// save the match model
			req.match = match;

			next();
		});
	});

	this.app.get('/', this.index.bind(this));

  // TODO this should be only one
	this.app.get('/live', this.live.bind(this));
	this.app.get('/archive', this.archive.bind(this));

	this.app.get('/new', this._new.bind(this));
	this.app.get('/match/:matchId', this.match.bind(this));
};

/**
 * Get /
 */

Minute.prototype.index = function index(req, res, next){
	var self = this.app.minute.models;

	// TODO: errors here should be in next()
	self.Match.count({ active: true }, function indexActives(err, actives){
		if (err) return next(err);

		self.Match.count({ active: false }, function indexInactives(err, inactives){
			if (err) return next(err);

			res.render('index', {
				title: 'Matches list', locals: {
					active: actives, inactive: inactives
				}
			});
		});
	});
};

/**
 * Get /live
 */

Minute.prototype.live = function live(req, res, next){
	var self = this.app.minute.models;

	self.Match.find({ active: true }, function indexActives(err, list){
		if (err) return next(err);

		res.render('matches', {
			title: 'Live matches list', locals: {
				matches: list
			}
		});
	});
};

/**
 * Get /archive
 */

Minute.prototype.archive = function archive(req, res, next){
	var self = this.app.minute.models;

	self.Match.find({ active: false }, function indexActives(err, list){
		if (err) return next(err);

		res.render('matches', {
			title: 'Archive matches list', locals: {
				matches: list
			}
		});
	});
};

/**
 * Get /new
 */

Minute.prototype._new = function _new(req, res, next){
	var game = child.fork('lib/faker.js');

	game.on('message', function(message){
		res.redirect('/#/match/' + message);
	});
};

/**
 * Get /match/:id
 */

Minute.prototype.match = function match(req, res){
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
};

/**
 * Redis conection
 */

Minute.prototype.getRedis = function(){
	var env = process.env;

	return redis.createClient(
		env.REDIS_PORT, env.REDIS_HOST
	);
};

/**
 * Socket.io listeners
 */

Minute.prototype.listeners = function(){
	this.io.on('connection', function(socket){
		// nothing for now
	});
};

/**
 * Redis PubSub subscriptions
 */

Minute.prototype.subscribes = function(){
	var self = this;

	// register to all messages
	this.redis.psubscribe('*');

	// received a published message
	this.redis.on('pmessage', function(pattern, match, message){
		self.handlePubSub(
			match, JSON.parse( message )
		);
	});
};

/**
 * Redis PubSub message handler
 */

Minute.prototype.handlePubSub = function( match, message ){
	switch( message.type ){
		case 'goal':
		case 'default':
		case 'redcard':
		case 'yellowcard':
			this.message( match, message );
	}
};

/**
 * Match messages dispatch
 */

Minute.prototype.message = function( match, message ){
	this._io.of( '/' + match ).emit('narration', message);
	console.log('send', message);
};

// expose it
module.exports = Minute;
