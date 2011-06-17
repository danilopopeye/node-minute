/**
 * Module dependencies
 */

var
	Match, Play, Team, Player,
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

/**
 * Connect to database
 */

mongoose.connect('mongodb://localhost/minute');

/**
 * Players
 */

Player = new Schema({
	number: Number,
	name: String
});

/**
 * Teams
 */

Team = new Schema({
	name: String,
	acronym: String,
	score: { type: Number, default: 0 },
	rooster: [ Player ],
	substitutes: [ Player ]
});

/**
 * Plays
 */

Play = new Schema({
	time: Number,
	type: String,
	text: String
});

/**
 * Matches
 */

Match = new Schema({
	time: { type: Number, default: 0 },
	plays: [ Play ],
	teams: [ Team ]
});

Match.virtual('home').get(function(){
	return this.teams[0];
});

Match.virtual('away').get(function(){
	return this.teams[0];
});

/**
 * Exports all models
 */

exports.Plays = mongoose.model('plays', Play);
exports.Players = mongoose.model('players', Player);
exports.Teams = mongoose.model('teams', Team);
exports.Matches = mongoose.model('matches', Match);
