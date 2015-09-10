// External dependencies
var Auth = require( './auth' ),
	merge = require( 'merge' ),
	wpcom,
	debug = require( 'debug' )( 'warp:upload' ),
	q = require( 'q' );

// Internal dependencies
var Styles = require( './styles' ),
	Site = require( './site' );

function uploadSite() {
	var promise = q.defer();
	debug( 'uploadSite', Site.getUrl() );
	uploadStylesForSite()
	.then( promise.resolve )
	.catch( promise.reject );
	return promise.promise;
}

function uploadStylesForSite() {
	var promise = q.defer();
	Styles.findFilename()
	.then( Styles.readStyles )
	.then( function() {
		return uploadCss( { 'css': Styles.getStyles(), 'preprocessor': Styles.getPreprocessor() } );
	} )
	.then( promise.resolve )
	.catch( promise.reject );
	return promise.promise;
}

function uploadCss( cssData ) {
	var promise = q.defer();
	// We have to load this down here because we have to wait for the token to be read.
	wpcom = require( 'wpcom' )( Auth.getToken() );
	var wpcomPost = q.nbind( wpcom.req.post, wpcom.req );

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
	wpcomPost( '/sites/' + Site.getUrl() + '/customcss', cssData )
	.then( function() {
		debug( 'upload of css successful' );
		promise.resolve();
	} )
	.catch( function( err ) {
		console.error( 'error uploading css:', err.statusCode, err.name, err.message );
		promise.reject();
	} );
	return promise.promise;
}

module.exports = uploadSite;
