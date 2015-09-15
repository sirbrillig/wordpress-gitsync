#!/usr/bin/env node

// External dependencies
var chokidar = require( 'chokidar' ),
	parseArgs = require( 'minimist' );

// Internal dependencies
var Site = require( '../lib/site' ),
	Auth = require( '../lib/auth' ),
	downloadSite = require( '../lib/download' ),
	Upload = require( '../lib/upload' );

var helpText = 'wordpress-warp: A tool to download and upload WordPress content and settings to a local directory.\n' +
	'--site=<url>\t\tOperate on the specified WordPress site. Must be WordPress.com or Jetpack.\n' +
	'--directory=<path>\tUse <path> as the directory for downloading or uploading. Defaults to the hostname.\n' +
	'--download\t\tDownload the site\'s content.\n' +
	'--upload\t\tUpload the local version of the site\'s content.\n' +
	'--watch\t\t\tWhen combined with --upload watches files for changes and upload whenever they change.\n';

// Parse command-line arguments
var argv = parseArgs( process.argv.slice( 2 ), {
	boolean: true
} );
if ( ! argv.site || ! argv.site.length ) {
	console.log( helpText );
	console.error( 'Provide a site with the --site option' );
	process.exit( 1 );
}
if ( ! argv.download && ! argv.upload ) {
	console.log( helpText );
	console.error( 'Either --download or --upload are required' );
	process.exit( 1 );
}
if ( argv.directory && argv.directory.length ) {
	Site.setSiteDirectory( argv.directory );
}

function beginWatching() {
	var toWatch = './' + Site.getSiteDirectory();
	console.log( 'watching for changes to', toWatch );
	chokidar.watch( toWatch, { persistent: true } ).on( 'change', function( path ) {
		console.log( 'changes detected to', path );
		Upload.uploadChangedFile( path )
		.then( function() {
			console.log( 'upload complete.' );
		} );
	} );
}

function beginWarp() {
	Site.setSiteUrl( argv.site );

	if ( argv.download ) {
		Auth.loadToken()
		.then( downloadSite )
		.then( function() {
			console.log( 'download complete.' );
		} )
		.catch( function() {
			console.log( 'download failed. Look above for errors.' );
		} );
	} else if ( argv.upload ) {
		Auth.loadToken()
		.then( Upload.uploadSite )
		.then( function() {
			if ( argv.watch ) {
				return beginWatching();
			}
			// Explicitly kill the app in case a web server is running
			console.log( 'upload complete.' );
			process.exit();
		} )
		.catch( function() {
			console.log( 'upload failed. Look above for errors.' );
		} );
	}
}

// Make sure App settings are set.
Auth.loadSettings()
.catch( Auth.promptUserForSettings )
.then( beginWarp );
