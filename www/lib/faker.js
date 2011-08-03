/**
 * Module dependencies
 */

var
	mongoose = require('mongoose'),
	models = require('./models')(mongoose),
	faker = require('Faker'),
	REDIS = require('redis'), redis;

/**
 * r
 * generate random integer
 * @param {Number} n
 * @return {Number}
 */

function r(n){
	return parseInt( Math.random() * ( n || 666 ), 10 );
}

/**
 * getRedisClient
 * returns a new redis connection
 * @return {Object}
 */

function getRedisClient(){
	var opt = process.env['redis'] || '6379:127.0.0.1';

	opt = opt.split(':');

	return REDIS.createClient.apply( REDIS, opt );
}

/**
 * Game
 * Generate random game
 * @constructor
 */

function Game(){
	// Match Model
	this.match = new models.Match();

	// make game active
	this.match.active = true;

	// get the teams players
	this.buildTeams(
		// kick off
		this.start.bind( this )
	);

	// mongo hook for redis
	this.registerHooks();
}

/**
 * Generate the redis key
 */

Game.prototype.key = function(){
	var args = Array.prototype.slice.apply( arguments );
	args.unshift( this.match._id );
	return args.join(':');
};

/**
 * Register the Mongoose hooks
 */

Game.prototype.registerHooks = function(){
	var self = this;
	models._Play.post('save', function(){
		redis.publish( self.key( this.type ), JSON.stringify( this ) );
	});
};

/**
 * Build the teams and roosters
 */

Game.prototype.buildTeams = function( cb ){
	for( var t = 1; t < 3; t++ ){
		var team = new models.Team();

		// team info
		team.name = faker.Company.companyName();
		team.acronym = this.acronym( team.name );

		// build the players list
		for( var i = 1; i < 18; i++ ){
			team[( i < 12 ? 'rooster' : 'substitutes' )].push({
				number: i, name: faker.Name.findName()
			});
		}

		// add the team
		this.match.teams.push( team );
	}

	// save the teams
	this.match.save(cb);
};

/**
 * Generates a better acronym
 * @param {String} name
 * @return {String} acronym
 */

Game.prototype.acronym = function(name){
	var acr = name.replace(/[^A-Z]/g,'');

	return (
		acr.length === 3 ? acr : name.substr(0, 3)
	).toUpperCase();
};

/**
 * Start the game
 */

Game.prototype.start = function( err ){
	if( err !== null ){
		throw new Error( err );
	}

	// log the game id
	console.log( this.match._id );

	// first message
	this.status('start');

	// time loop
	this.timeout = setInterval(
		this.tick.bind( this ), 1000
	);
};

/**
 * Finish the game
 */

Game.prototype.finish = function(){
	var self = this;

	// clear the event loop
	clearTimeout( this.timeout );

	// make inactive
	this.match.active = false;

	// save it
	this.match.save(function(){
		// last message
		self.status('finish');

		// log the event
		console.log('Finishing game', self.match.id);

		// exit
		process.exit(0);
	});
};

/**
 * Main game event loop
 */

Game.prototype.tick = function(){
	var time = parseInt( this.match.time, 10 );

	// check the time and finish the game
	if( time === ( 45 + r(5) ) || time === 50 ){
		return this.finish();
	}

	var action, active, play = new models.Play();

	// get the action type
	action = play.type = this.getPlayType();

	// play model
	play.text = faker.Lorem.sentence();

	// update the game time
	play.time = ++this.match.time;

	// on some actions
	if( action !== 'default' ){
		// select the affected team
		play._team = this.match.teams[ r(2) ];
		play.team = play._team._id;

		// get not expelled players
		active = play._team.rooster.filter(function(player){
			return !player.cards.red;
		});

		// select the affected random player
		play.player = active[ r( active.length ) ]._id;

		// do the actions
		play = this[ action ]( play );
	}

	// add the play
	this.match.plays.push( play );

	// save the match
	this.match.save(function( err, match ){
		console.log(
			action.toUpperCase(), match.time, play.text
		);
	});
};

/**
 * Generate a random play type
 * @return {String} play
 */

Game.prototype.getPlayType = function(){
	return ['yellowcard','redcard','substitution','goal'][ r(10) ] || 'default';
};

/**
 * Status action
 * @param {String} type
 */

Game.prototype.status = function(type){
	console.log( type.toUpperCase(), 'The game has '+ type +'ed!' );
};

/**
 * Yellowcard
 * @param {Object} play model
 */

Game.prototype.yellowcard = function( play ){
	var player = play._team.rooster.id( play.player );

	// second yellow add a red too
	if( ++player.cards.yellow === 2 ){
		play = this.redcard( play );
	}

	return play;
};

/**
 * Redcard
 * @param {Object} play model
 */

Game.prototype.redcard = function( play ){
	play._team.rooster.id( play.player )

		// update the status
		.cards.red = true;

	return play;
};

/**
 * Substitution
 * @param {Object} play model
 */

Game.prototype.substitution = function( play ){
	return play;
};

/**
 * Goal
 * @param {Object} play model
 * @return {Object} play
 */

Game.prototype.goal = function( play ){
	// team score
	play._team.score++;

	// player goal count
	play._team.rooster.id( play.player ).goal++;

	return play;
};

/**
 * Connect to mongodb
 */

mongoose.connect( process.env['mongo'] || 'mongodb://localhost/minute' );

/**
 * Connect to redis
 */

redis = getRedisClient();

/**
 * Initialize
 */

mongoose.connection.on('open', function(){
	exports = new Game();
});
