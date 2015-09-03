// External dependencies
var wpcom = require( 'wpcom' )(),
	debug = require( 'debug' )( 'wpgs:upload' ),
	q = require( 'q' );

// Internal dependencies
var Styles = require( './styles' ),
	Site = require( './site' );

// Promisify wpcom functions
var wpcomPost = q.nbind( wpcom.req.post, wpcom.req );

function uploadSite() {
	debug( 'uploadSite', Site.getUrl() );
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

	debug( 'uploadCss', Site.getUrl() );
	wpcomPost( '/sites/' + Site.getUrl() + '/customcss', cssData )
	.then( function( data ) {
		debug( 'upload of css successful', data );
	} )
	.catch( function( err ) {
		console.error( 'error posting CSS', err );
	} );
}

module.exports = uploadSite;
