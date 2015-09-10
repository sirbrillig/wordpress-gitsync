// External dependencies
var wpcom = require( 'wpcom' )(),
	fs = require( 'fs' ),
	debug = require( 'debug' )( 'wpgs:download' ),
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
		console.error( err );
		promise.reject();
	} )
	.then( function( data ) {
		var cssType = 'css';
		if ( ! data.css ) {
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
		console.error( err );
		promise.reject();
	} )
	.then( function( list ) {
		if ( ! list.posts ) {
			promise.reject();
			return;
		}
		createPostsDirectory()
		.then( function() {
			writePostsToFiles( list.posts );
			// TODO: need a promise for this
			promise.resolve();
		} );
	} );
	return promise.promise;
}

function writePostsToFiles( posts ) {
	posts.map( writePostToFile );
}

function writePostToFile( post ) {
	var jsonFilename = getPostsDirectory() + '/' + post.slug + '.json',
		htmlFilename = getPostsDirectory() + '/' + post.slug + '.html';
	console.log( 'writing', jsonFilename );
	fs.writeFile( jsonFilename, Post.postToString( post ) );
	console.log( 'writing', htmlFilename );
	fs.writeFile( htmlFilename, Post.postToContent( post ) );
}

function writeCssToFile( css, type ) {
	if ( ! type ) {
		type = 'css';
	}
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
	// TODO: handle case where directory already exists
	return q.nfcall( fs.mkdir, getSiteDirectory() );
}

function createPostsDirectory() {
	return q.nfcall( fs.mkdir, getPostsDirectory() );
}

module.exports = downloadSite;
