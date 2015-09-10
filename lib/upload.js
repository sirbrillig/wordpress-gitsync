// External dependencies
var merge = require( 'merge' ),
	path = require( 'path' ),
	string = require( 'string' ),
	fs = require( 'fs' ),
	debug = require( 'debug' )( 'warp:upload' ),
	q = require( 'q' );

// Internal dependencies
var Auth = require( './auth' ),
	Styles = require( './styles' ),
	Site = require( './site' );

// Promisify functions
var readDir = q.nfbind( fs.readdir ),
	readFile = q.nbind( fs.readFile, fs );

function uploadSite() {
	debug( 'uploadSite', Site.getUrl() );
	return uploadStylesForSite()
	.then( uploadPostsForSite );
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
	return wpcomPost( path.join( '/sites', Site.getUrl(), 'customcss' ), cssData )
	.then( function() {
		debug( 'upload of css successful' );
	} )
	.catch( function( err ) {
		console.error( 'error uploading css:', err.statusCode, err.name, err.message );
		throw new Error( 'error uploading css' );
	} );
}

function getPostsDirectory() {
	return path.join( Site.getSiteDirectory(), 'posts' );
}

function preparePostsForUpload( filenames ) {
	var htmlFiles = filenames.filter( function( filename ) {
		return string( filename ).endsWith( '.html' );
	} );
	return filenames.filter( function( filename ) {
		return string( filename ).endsWith( '.json' );
	} )
	.filter( function( filename ) {
		return ~ htmlFiles.indexOf( path.basename( filename, '.json' ) + '.html' );
	} );
}

function uploadPosts( filenames ) {
	debug( 'finding valid posts from ' + filenames.length + ' total files' );
	filenames = preparePostsForUpload( filenames );
	debug( 'uploading ' + filenames.length + ' posts' );
	return q.all( filenames.map( uploadPost ) );
}

function uploadPost( jsonFilename ) {
	jsonFilename = path.join( '../', getPostsDirectory(), jsonFilename );
	debug( 'loading post data from', jsonFilename );
	try {
		var postData = require( jsonFilename );
	} catch ( err ) {
		debug( 'Error reading post data file ' + jsonFilename, err );
		throw new Error( 'Error reading post data file ' + jsonFilename );
	}
	debug( 'found post data', postData );
	return readFile( path.join( getPostsDirectory(), path.basename( jsonFilename, '.json' ) + '.html' ), { encoding: 'utf8' } )
	.then( function( html ) {
		postData.content = html;
		debug( 'ready to upload', postData );
		// TODO: upload that thing
	} );
}

function uploadPostsForSite() {
	debug( 'preparing to upload posts' );
	return readDir( getPostsDirectory() )
	.then( uploadPosts );
}

module.exports = uploadSite;
