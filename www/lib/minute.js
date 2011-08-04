/**
 * Minute
 * @constructor
 * @param {Object} express app
 * @param {Object} mongoose models
 */

function Minute(app, models){
	this.app = app;
	this.models = models;

	// circular reference is ok?
	this.app.minute = this;

	// main app routes
	this.routes();

	// start the express app
	app.listen( app.set('port') );
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

	this.app.get('/', this.index);
	this.app.get('/match/:matchId', this.match);
};

/**
 * Get /
 */

Minute.prototype.index = function index(req, res, next){
	var self = this.app.minute.models;

	// TODO: errors here should be in next()
	self.Match.find({ active: true }, function indexActives(err, actives){
		if (err) return next(err);

		self.Match.find({ active: false }, function indexInactives(err, inactives){
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

// expose it
module.exports = Minute;
