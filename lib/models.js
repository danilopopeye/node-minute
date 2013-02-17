/**
 * Module dependencies
 */

var
	Match, Play, Team, Player,
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

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

Match.virtual('title').get(function(){
	var h = this.teams[0], a = this.teams[1];

	return [
		// home ? x ? away
		h.name, h.score, 'x', a.score, a.name
	].join(' ');
});

/**
 * Exports all models
 */

module.exports = function(mg){
	return {
		_Play: Play,
		Play: mg.model('plays', Play),
		Player: mg.model('players', Player),
		Team: mg.model('teams', Team),
		Match: mg.model('matches', Match)
	};
};
