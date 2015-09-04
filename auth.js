// External dependencies
var fs = require( 'fs' ),
	openurl = require( 'openurl' ),
	url = require( 'url' ),
	path = require( 'path' ),
	express = require( 'express' ),
	wpcomOAuth = require( 'wpcom-oauth' ),
	debug = require( 'debug' )( 'wpgs:auth' ),
	q = require( 'q' );

// Internal dependencies
var Site = require( './site' );

// Promisify functions
var readFile = q.nbind( fs.readFile, fs );

var authFilename = '.wpcomauth',
	token = '';

function loadTokenFromFile() {
	var promise = q.defer();
	authFilename = authFilename + '-' + Site.getUrl();
	readFile( authFilename, { encoding: 'utf8' } )
	.then( function( content ) {
		if ( ! content || ! content.replace ) {
			debug( 'invalid data found in auth file', content );
			throw 'Invalid data found in auth file';
		}
		token = content.replace( /\s/, '' );
		debug( 'auth token loaded' );
		promise.resolve();
	} )
	.catch( function() {
		debug( 'error reading wpcomauth token' );
		console.error( 'No WordPress.com auth token found in `' + authFilename + '`' );
		promise.reject();
	} );
	return promise.promise;
}

var server;

function getAuthFromServer() {
	var promise = q.defer();
	var settings = require( './settings.json' );
	var wpoauth = wpcomOAuth( settings );
	var pub = path.join( __dirname, '/public' );
	var app = express();
	app.use( express.static( pub ) );

	app.set( 'views', path.join( __dirname, 'views' ) );
	app.set( 'view engine', 'jade' );

	// Home
	app.get( '/', function( req, res ) {
		res.render( 'home', {
			settings: settings,
			url: wpoauth.urlToConnect() + '&blog=' + Site.getUrl()
		} );
	} );

	// OAuth response with code
	var redirectPath = url.parse( wpoauth.opts.url.redirect ).pathname;
	app.get( redirectPath, function( req, res ) {
		var code = req.query.code;
		res.render( 'ready', { code: code } );
	} );

	// Access token fetch
	app.get( '/get_token/:code', function( req, res ) {
		wpoauth.code( req.params.code );
		wpoauth.requestAccessToken( function( err, data ) {
			if ( err ) {
				return res.render( 'error', err );
			}
			res.render( 'ok', data );
			debug( 'token received from server' );
			token = data.access_token;
			fs.writeFile( authFilename, token );
			promise.resolve();
			stopWebServer();
		} );
	} );

	var port = settings.port || 3001;
	server = app.listen( port );
	console.log( 'Started web server for authentication request on port', port );
	openurl.open( 'http://localhost:' + port );
	return promise.promise;
}

function stopWebServer() {
	server.close( function() {
		debug( 'web server closed' );
	} );
}

var Auth = {

	loadToken: function() {
		var promise = q.defer();
		loadTokenFromFile()
		.catch( getAuthFromServer )
		.catch( promise.reject )
		.then( promise.resolve );
		return promise.promise;
	},

	getToken: function() {
		return token;
	}

};

module.exports = Auth;
