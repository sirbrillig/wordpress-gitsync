// External dependencies
var Auth = require( './auth' ),
	merge = require( 'merge' ),
	debug = require( 'debug' )( 'warp:upload' ),
	q = require( 'q' );

// Internal dependencies
var Styles = require( './styles' ),
	Site = require( './site' );

function uploadSite() {
	debug( 'uploadSite', Site.getUrl() );
	return uploadStylesForSite();
}

function uploadStylesForSite() {
	return Styles.findFilename()
	.then( Styles.readStyles )
	.then( function() {
		return uploadCss( { 'css': Styles.getStyles(), 'preprocessor': Styles.getPreprocessor() } );
	} );
}

function uploadCss( cssData ) {
	// We have to load this down here because we have to wait for the token to be read.
	var wpcom = require( 'wpcom' )( Auth.getToken() ),
		wpcomPost = q.nbind( wpcom.req.post, wpcom.req );

	var defaults = {
		preprocessor: '',
		css: '',
		add_to_existing: 'true'
	};
	cssData = merge( defaults, cssData );

	if ( cssData.preprocessor === 'css' ) {
		cssData.preprocessor = '';
	}
	if ( cssData.preprocessor === 'scss' ) {
		cssData.preprocessor = 'sass';
	}

	debug( 'uploadCss', Site.getUrl() );
	return wpcomPost( '/sites/' + Site.getUrl() + '/customcss', cssData )
	.then( function() {
		debug( 'upload of css successful' );
	} )
	.catch( function( err ) {
		console.error( 'error uploading css:', err.statusCode, err.name, err.message );
		throw new Error( 'error uploading css' );
	} );
}

module.exports = uploadSite;
