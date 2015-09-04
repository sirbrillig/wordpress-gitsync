// External dependencies
var fs = require( 'fs' ),
	url = require( 'url' ),
	path = require( 'path' ),
	express = require( 'express' ),
	wpcomOAuth = require( 'wpcom-oauth' ),
	debug = require( 'debug' )( 'wpgs:auth' ),
	q = require( 'q' );

// Promisify functions
var readFile = q.nbind( fs.readFile, fs );

var authFilename = '.wpcomauth',
	token = '';

var Auth = {

	beginAuth: function() {
		var promise = q.defer();
		var settings = require( './settings.json' );
		var wpoauth = wpcomOAuth( settings );
		var pub = path.join( __dirname, '/public' );
		var app = express();
		app.use( express.static( pub ) );

		// Home
		app.get( '/', function( req, res ) {
			res.render( 'home', {
				settings: settings,
				url: wpoauth.urlToConnect()
			} );
		} );

		// OAuth response with code
		var redirectPath = url.parse( wpoauth.opts.url.redirect ).pathname;
		app.get( redirectPath, function( req, res ) {
			var code = req.query.code;
			res.render( 'ready', { code: code } );
		} );

		// Access token fetch
		app.get( '/get-token/:code', function( req, res ) {
			wpoauth.code( req.params.code );
			wpoauth.requestAccessToken( function( err, data ) {
				if ( err ) {
					return res.render( 'error', err );
				}
				res.render( 'complete', data );
			} );
		} );

		var port = settings.port || 3001;
		app.listen( port );
		console.log( 'Started web server for authentication request on port', port );
		return promise.promise;
	},

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
