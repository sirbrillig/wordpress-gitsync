// External dependencies
var wpcom = require( 'wpcom' )(),
	debug = require( 'debug' )( 'wpgs:upload' ),
	q = require( 'q' );

// Internal dependencies
var Styles = require( './styles' );

// Promisify wpcom functions
var wpcomPost = q.nbind( wpcom.req.post, wpcom.req );

var siteUrl = 'unknown_site';

function uploadSite( site ) {
	siteUrl = site._id;
	debug( 'uploadSite', siteUrl );
	Styles.findFilename()
	.then( Styles.readStyles )
	.then( function() {
		uploadCss( { 'css': Styles.getStyles(), 'preprocessor': Styles.getPreprocessor() } );
	} );
}

function uploadCss( cssData ) {
	if ( cssData.preprocessor === 'css' ) {
		cssData.preprocessor = '';
	}
	if ( cssData.preprocessor === 'scss' ) {
		cssData.preprocessor = 'sass';
	}

	debug( 'uploadCss', siteUrl );
	wpcomPost( '/sites/' + siteUrl + '/customcss', cssData )
	.then( function( data ) {
		debug( 'upload of css successful', data );
	} )
	.catch( function( err ) {
		console.error( 'error posting CSS', err );
	} );
}

module.exports = uploadSite;
