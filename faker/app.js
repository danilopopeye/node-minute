/**
 * Module dependencies
 */

var game,
	faker = require('Faker');

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
 * Game
 * Generate random game
 * @constructor
 */

function Game(){
	// generate the game id
	this._key();

	// cache the game data
	this.cache = {};

	// kick off
	this.start();
}

/**
 * Generate a random id
 */

Game.prototype._key = function(){
	// get the random game id
	this.id = Math.random().toString().substr(2);
};

/**
 * Build the teams and roosters
 */

Game.prototype.buildTeams = function(){
	for( var t = 1; t < 3; t++ ){
		this.cache[ t ] = {};
		this.cache[ t ].score = 0;
		this.cache[ t ].plays = [];
		this.cache[ t ].roster = {};
		this.cache[ t ].substitutes = {};
		this.cache[ t ].name = faker.Company.companyName();
		this.cache[ t ].acronym = this.cache[ t ].name.substr(-3).toUpperCase();

		for( var i = 1; i < 12; i++ ){
			this.cache[ t ].roster[ i ] = faker.Name.findName();
		}

		for( var j = 12; j < 18; j++ ){
			this.cache[ t ].substitutes[ j ] = faker.Name.findName();
		}
	}
};

/**
 * Start the game
 */

Game.prototype.start = function(){
	// log the game id
	console.log('Starting game: ', this.id);

	// save the last time
	this.time = 0;

	// get the teams players
	this.buildTeams();

	// first message
	this.status('start');

	// time loop
	this.timeout = setInterval(
		this.tick.bind( this ), 1000 * 1
	);
};

/**
 * Finish the game
 */

Game.prototype.finish = function(){
	// clear the event loop
	clearTimeout( this.timeout );

	// last message
	this.status('finish');

	// log the event
	console.log('Finishing game', this.id);
};

/**
 * Main game event loop
 */

Game.prototype.tick = function(){
	// check the time and finish the game
	if( this.time === ( 45 + r(5) ) || this.time === 50 ){
		return this.finish();
	}

	var
		// get the action
		action = this.getPlayType(),
		// play description
		play = faker.Lorem.sentence();

	// update the game time
	this.time++;

	// do the actions
	if( action !== 'default' ){
		this[ action ]({
			time: this.time,
			team: 1 + r(2),
			play: play
		});
	}

	console.log( action.toUpperCase(), this.time, play );
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
 * @param {Object} time, team, play
 */

Game.prototype.yellowcard = function(o){
};

/**
 * Redcard
 * @param {Object} time, team, play
 */

Game.prototype.redcard = function(o){
};

/**
 * Substitution
 * @param {Object} time, team, play
 */

Game.prototype.substitution = function(o){
};

/**
 * Goal
 * @param {Object} time, team, play
 */

Game.prototype.goal = function(o){
};

/**
 * Initialize
 */

game = new Game();
