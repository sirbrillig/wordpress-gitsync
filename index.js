var argv = require( 'minimist' )( process.argv.slice( 2 ) );
var downloadSite = require( './download' );

if ( ! argv.site ) {
	console.error( 'Provide a site with the --site option' );
	process.exit( 1 );
}

var wpcom = require( 'wpcom' )();

var site = wpcom.site( argv.site );
// TODO: verify we connected

if ( argv.download ) {
	downloadSite( site );
}
