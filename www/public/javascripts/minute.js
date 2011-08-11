(function(){
	function Minute( url ){
		var self = this;

		this.id = url.substr(1);

		// socket.io connection to game namespace
		this.io = io.connect( '/'+ this.id );

		// server events
		this.io.on( 'narration', self.narration );
	}

	Minute.prototype.narration = function( data ){
		console.log( 'narration', data );

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
