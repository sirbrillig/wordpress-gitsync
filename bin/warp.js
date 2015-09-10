#!/usr/bin/env node

// External dependencies
var chokidar = require( 'chokidar' ),
	parseArgs = require( 'minimist' );

// Internal dependencies
var Site = require( '../lib/site' ),
	Auth = require( '../lib/auth' ),
	downloadSite = require( '../lib/download' ),
	uploadSite = require( '../lib/upload' );

var helpText = 'wordpress-warp: A tool to download and upload WordPress content and settings to a local directory.\n' +
	'--site <url>\tOperate on the specified WordPress site. Must be WordPress.com or Jetpack.\n' +
	'--download\tDownload the site\'s content.\n' +
	'--upload\tUpload the local version of the site\'s content.' +
	'--watch\tWhen combined with --upload watches files for changes and upload whenever they change.\n';

// Parse command-line arguments
var argv = parseArgs( process.argv.slice( 2 ), {
	boolean: true
} );
if ( ! argv.site ) {
	console.log( helpText );
	console.error( 'Provide a site with the --site option' );
	process.exit( 1 );
}
if ( ! argv.download && ! argv.upload ) {
	console.log( helpText );
	console.error( 'Either --download or --upload are required' );
	process.exit( 1 );
}

function beginWatching() {
	var toWatch = './' + Site.getSiteDirectory();
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
	downloadSite()
	.then( function() {
		console.log( 'download complete.' );
	} )
	.catch( function() {
		console.log( 'download failed.' );
	} );
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
