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

	// make game active
	this.match.active = true;

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
		console.log('Finishing game', self.id);

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

	var action, play = new models.Plays();

	// get the action type
	action = play.type = this.getPlayType();

	// play model
	play.text = faker.Lorem.sentence();

	// update the game time
	play.time = ++this.match.time;

	// on some actions
	if( action !== 'default' ){
		// select the affected team
		play.team = r(2);

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
	return play;
};

/**
 * Redcard
 * @param {Object} play model
 */

Game.prototype.redcard = function( play ){
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
	var team = this.match.teams[ play.team ],
		player = team.rooster[ r(team.rooster.length) ];

	// team score
	team.score++;

	// player goal count
	player.goal++;

	// save the game author
	play.players = player._id;

	return play;
};

/**
 * Initialize
 */

game = new Game();
