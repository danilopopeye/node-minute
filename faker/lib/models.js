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
	name: String,
	goal: { type: Number, default: 0 },
	cards: {
		red: { type: Boolean, default: false },
		yellow: { type: Number, default: 0 }
	}
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
	text: String,
	team: ObjectId,
	player: String
});

/**
 * Matches
 */

Match = new Schema({
	time: { type: Number, default: 0 },
	active: { type: Boolean, default: false },
	plays: [ Play ],
	teams: [ Team ]
});

Match.virtual('home').get(function(){
	return this.teams[0];
});

Match.virtual('away').get(function(){
	return this.teams[1];
});

/**
 * Exports all models
 */

exports.Plays = mongoose.model('plays', Play);
exports.Players = mongoose.model('players', Player);
exports.Teams = mongoose.model('teams', Team);
exports.Matches = mongoose.model('matches', Match);
