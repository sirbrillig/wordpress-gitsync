// Internal dependencies
var parseArgs = require( 'minimist' ),
	Site = require( './site' ),
	downloadSite = require( './download' ),
	uploadSite = require( './upload' );

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

Site.connect( argv.site );
// TODO: verify we connected

if ( argv.download ) {
	downloadSite();
} else if ( argv.upload ) {
	uploadSite();
}
