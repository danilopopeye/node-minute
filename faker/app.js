/**
 * Module dependencies
 */

var game,
	mongoose = require('mongoose'),
	models = require('./lib/models'),
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
	// Match Model
	this.match = new models.Matches();

	// get the teams players
	this.buildTeams(
		// kick off
		this.start.bind( this )
	);
}

/**
 * Build the teams and roosters
 */

Game.prototype.buildTeams = function( cb ){
	for( var t = 1; t < 3; t++ ){
		var team = new models.Teams();

		// team info
		team.name = faker.Company.companyName();
		team.acronym = team.name.substr(-3).toUpperCase();

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
 * Start the game
 */

Game.prototype.start = function( err ){
	if( err !== null ){
		throw new Error( err );
	}

	// log the game id
	console.log('Starting game: ', this.match._id);

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
