var parseArgs = require( 'minimist' );
var downloadSite = require( './download' );
var uploadSite = require( './upload' );

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

var wpcom = require( 'wpcom' )();

var site = wpcom.site( argv.site );
// TODO: verify we connected

if ( argv.download ) {
	downloadSite( site );
}

if ( argv.upload ) {
	uploadSite( site );
}
