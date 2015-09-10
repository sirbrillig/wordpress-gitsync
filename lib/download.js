// External dependencies
var wpcom = require( 'wpcom' )(),
	fs = require( 'fs' ),
	debug = require( 'debug' )( 'warp:download' ),
	q = require( 'q' );

// Promisify functions
var wpcomGet = q.nbind( wpcom.req.get, wpcom.req ),
	writeFile = q.nfbind( fs.writeFile );

// Internal dependencies
var Post = require( './post-encoding' ),
	Site = require( './site' );

function downloadSite() {
	var promise = q.defer();
	debug( 'downloadSite', Site.getUrl() );
	createSiteDirectory()
	.then( downloadPages )
	.then( downloadCss )
	.then( promise.resolve )
	.catch( promise.reject );
	return promise.promise;
}

function downloadCss() {
	var promise = q.defer();
	debug( 'downloadCss', Site.getUrl() );
	wpcomGet( '/sites/' + Site.getUrl() + '/customcss' )
	.fail( function( err ) {
		console.error( 'Error while downloading css:', err );
		promise.reject();
	} )
	.then( function( data ) {
		var cssType = 'css';
		if ( ! data.css ) {
			debug( 'no css found in data returned from customcss', data );
			promise.reject();
			return;
		}
		if ( data.preprocessor === 'sass' ) {
			cssType = 'scss';
		}
		if ( data.preprocessor === 'less' ) {
			cssType = 'less';
		}
		writeCssToFile( data.css, cssType )
		.then( promise.resolve )
		.catch( promise.reject );
	} );
	return promise.promise;
}

function downloadPages() {
	var promise = q.defer();
	var site = Site.getSite();
	var wpcomPostList = q.nbind( site.postsList, site );
	wpcomPostList( { type: 'page', status: 'publish' } )
	.catch( function( err ) {
		console.error( 'Error while downloading posts:', err );
		promise.reject();
	} )
	.then( function( list ) {
		if ( ! list.posts ) {
			promise.reject();
			return;
		}
		createPostsDirectory()
		.then( function() {
			return writePostsToFiles( list.posts );
		} )
		.catch( promise.reject )
		.then( promise.resolve );
	} );
	return promise.promise;
}

function writePostsToFiles( posts ) {
	return q.all( posts.map( writePostToFile ) );
}

function writePostToFile( post ) {
	debug( 'preparing to save data for post', post.title );
	return q.all( [ writePostJsonToFile( post ), writeHtmlToFile( post ) ] );
}

function writePostJsonToFile( post ) {
	var jsonFilename = getPostsDirectory() + '/' + post.slug + '.json';
	console.log( 'writing', jsonFilename );
	return writeFile( jsonFilename, Post.postToString( post ) );
}

function writeHtmlToFile( post ) {
	var htmlFilename = getPostsDirectory() + '/' + post.slug + '.html';
	console.log( 'writing', htmlFilename );
	return writeFile( htmlFilename, Post.postToContent( post ) );
}

function writeCssToFile( css, type ) {
	type = type || 'css';
	var filename = getSiteDirectory() + '/' + 'customcss.' + type;
	console.log( 'writing', filename );
	return writeFile( filename, css );
}

function getSiteDirectory() {
	return Site.getSiteDirectory();
}

function getPostsDirectory() {
	return getSiteDirectory() + '/posts';
}

function createSiteDirectory() {
	debug( 'creating site directory', getSiteDirectory() );
	return q.nfcall( fs.mkdir, getSiteDirectory() )
	.catch( function( err ) {
		if ( err.code === 'EEXIST' ) {
			debug( 'Site directory already exists' );
			return;
		}
		console.error( 'Error creating site directory' );
		throw new Error( 'Error creating site directory' );
	} );
}

function createPostsDirectory() {
	debug( 'creating posts directory', getPostsDirectory() );
	return q.nfcall( fs.mkdir, getPostsDirectory() )
	.catch( function( err ) {
		if ( err.code === 'EEXIST' ) {
			debug( 'Posts directory already exists' );
			return;
		}
		console.error( 'Error creating posts directory' );
		throw new Error( 'Error creating posts directory' );
	} );
}

module.exports = downloadSite;
