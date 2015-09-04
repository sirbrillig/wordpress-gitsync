// External dependencies
var fs = require( 'fs' ),
	debug = require( 'debug' )( 'wpgs:auth' ),
	q = require( 'q' );

// Promisify functions
var readFile = q.nbind( fs.readFile, fs );

var authFilename = '.wpcomauth',
	token = '';

var Auth = {

	loadToken: function() {
		var promise = q.defer();
		readFile( authFilename, { encoding: 'utf8' } )
		.then( function( content ) {
			if ( ! content || ! content.replace ) {
				throw 'Invalid data found in auth file: ' + content;
			}
			token = content.replace( /\s/, '' );
			debug( 'auth token loaded' );
			promise.resolve();
		} )
		.catch( function( err ) {
			debug( 'error reading wpcomauth token:', err );
			console.error( 'No WordPress.com auth token found. Please generate one and save it in `' + authFilename + '`' );
			promise.reject();
		} );
		return promise.promise;
	},

	getToken: function() {
		return token;
	}

};

module.exports = Auth;
