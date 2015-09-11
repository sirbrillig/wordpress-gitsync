// External dependencies
var fs = require( 'fs' ),
	prompt = require( 'prompt' ),
	openurl = require( 'openurl' ),
	url = require( 'url' ),
	path = require( 'path' ),
	express = require( 'express' ),
	wpcomOAuth = require( 'wpcom-oauth' ),
	debug = require( 'debug' )( 'warp:auth' ),
	q = require( 'q' );

// Internal dependencies
var Site = require( './site' );

// Promisify functions
var readFile = q.nbind( fs.readFile, fs ),
	writeFile = q.nfbind( fs.writeFile );

var authFilename = '.wpcomauth',
	server,
	settings,
	token = '';

function loadTokenFromFile() {
	authFilename = authFilename + '-' + Site.getSiteDirectory();
	debug( 'trying to load token from', authFilename );
	return readFile( authFilename, { encoding: 'utf8' } )
	.then( function( content ) {
		if ( ! content || ! content.replace ) {
			debug( 'invalid data found in auth file', content );
			throw new Error( 'Invalid data found in auth file' );
		}
		token = content.replace( /\s/, '' );
		debug( 'auth token loaded' );
	} )
	.catch( function() {
		debug( 'error reading wpcomauth token' );
		console.error( 'No WordPress.com auth token found in `' + authFilename + '`' );
		throw new Error( 'No WordPress.com auth token found' );
	} );
}

function loadSettings() {
	return readFile( 'settings.json', { encoding: 'utf8' } )
	.then( function( data ) {
		settings = JSON.parse( data );
	} );
}

function promptUserForSettings() {
	console.log( '' );
	console.log( 'No settings file detected. Creating one...' );
	console.log( 'You will need to visit this URL and create a new Application: https://developer.wordpress.com/apps/new/' );
	console.log( '' );
	console.log( 'Redirect URL must be "http://localhost:3001/connect/res"' );
	console.log( 'Type must be "Web"' );
	console.log( '' );
	var promptData = {
		properties: {
			client_id: {
				required: true,
				description: 'What is the Client ID?'
			},
			client_secret: {
				required: true,
				description: 'What is the Client Secret?'
			}
		}
	};
	prompt.start();
	var getPrompt = q.nbind( prompt.get, prompt );
	return getPrompt( promptData )
	.then( function( inputData ) {
		inputData.url = { redirect: 'http://localhost:3001/connect/res' };
		return writeFile( 'settings.json', JSON.stringify( inputData ) );
	} );
}

function getAuthFromServer() {
	var promise = q.defer();
	debug( 'starting oauth process' );
	if ( ! settings ) {
		console.error( 'Error trying to authenticate with WordPress.com. No settings.json found.' );
		promise.reject();
		return promise.promise;
	}
	var wpoauth = wpcomOAuth( settings );
	var requestAccessToken = q.nbind( wpoauth.requestAccessToken, wpoauth );
	var pub = path.join( path.dirname( __dirname ), '/public' );
	var app = express();
	app.use( express.static( pub ) );

	app.set( 'views', path.join( path.dirname( __dirname ), 'views' ) );
	app.set( 'view engine', 'jade' );

	// Home
	app.get( '/', function( req, res ) {
		var authUrl = wpoauth.urlToConnect( { blog: Site.getUrl() } );
		debug( 'got oauth redirect request; sending to', authUrl );
		res.redirect( authUrl );
	} );

	// OAuth response with code
	var redirectPath = url.parse( wpoauth.opts.url.redirect ).pathname;
	app.get( redirectPath, function( req, res ) {
		var code = req.query.code;
		debug( 'got oauth response with code', code );
		wpoauth.code( code );
		debug( 'requesting access token' );
		requestAccessToken()
		.then( function( data ) {
			res.render( 'ok', data );
			debug( 'token received from server' );
			token = data.access_token;
			writeFile( authFilename, token )
			.then( promise.resolve );
			stopWebServer();
		} )
		.catch( function( err ) {
			debug( 'error while reading response code', err );
			res.render( 'error', err );
		} );
	} );

	var port = settings.port || 3001;
	debug( 'starting web server on port', port );
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
		return loadTokenFromFile()
		.catch( getAuthFromServer );
	},

	getToken: function() {
		return token;
	},

	loadSettings: loadSettings,

	promptUserForSettings: promptUserForSettings

};

module.exports = Auth;
