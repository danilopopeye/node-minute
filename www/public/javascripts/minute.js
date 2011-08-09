(function(){
	function Minute( url ){
		var self = this;

		this.id = url.substr(1);
		this._url = $.mobile.path.parseUrl( document.location.href );

		// socket.io connection to game namespace
		this.io = io.connect( this._url.domain );

		// server events
		this.io.on( 'narration', self.narration );
	}

	Minute.prototype.narration = function( data ){
		$.mobile.activePage.find('.narration')
			.prepend('<li>'+ data.text +'</li>')
		.listview('refresh');
	};

	// when a match page is created
	$('.match').live('pagecreate', function(e){
		window.minute = new Minute(
			// /ObjectId
			$(this).data('url').substr(6)
		);
	});
})();
