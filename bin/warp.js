#!/usr/bin/env node

// External dependencies
var chokidar = require( 'chokidar' ),
	parseArgs = require( 'minimist' );

// Internal dependencies
var Site = require( '../lib/site' ),
	Auth = require( '../lib/auth' ),
	downloadSite = require( '../lib/download' ),
	uploadSite = require( '../lib/upload' );

// Parse command-line arguments
var argv = parseArgs( process.argv.slice( 2 ), {
	boolean: true
} );
if ( ! argv.site ) {
	console.error( 'Provide a site with the --site option' );
	process.exit( 1 );
}
if ( ! argv.download && ! argv.upload ) {
	console.error( 'Either --download or --upload are required' );
	process.exit( 1 );
}

function beginWatching() {
	var toWatch = './' + Site.getUrl();
	console.log( 'watching for changes to', toWatch );
	chokidar.watch( toWatch, { persistent: true } ).on( 'change', function( path ) {
		console.log( 'changes detected to', path );
		uploadSite()
		.then( function() {
			console.log( 'upload complete.' );
		} );
	} );
}

Site.connect( argv.site );

if ( argv.download ) {
	downloadSite();
} else if ( argv.upload ) {
	Auth.loadToken()
	.then( uploadSite )
	.then( function() {
		if ( argv.watch ) {
			return beginWatching();
		}
		// Explicitly kill the app in case a web server is running
		console.log( 'all done!' );
		process.exit();
	} );
}
