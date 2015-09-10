// External dependencies
var wpcom = require( 'wpcom' )(),
	path = require( 'path' ),
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
	debug( 'downloadSite', Site.getUrl() );
	return createSiteDirectory()
	.then( downloadPages )
	.then( downloadCss );
}

function downloadCss() {
	debug( 'downloadCss', Site.getUrl() );
	return wpcomGet( '/sites/' + Site.getUrl() + '/customcss' )
	.fail( function( err ) {
		console.error( 'Error while downloading css:', err );
		throw new Error( 'Error while downloading css' );
	} )
	.then( function( data ) {
		if ( ! data.css ) {
			debug( 'no css found in data returned from customcss', data );
			throw new Error( 'Error: no css found in data returned from customcss' );
		}
		return writeCssToFile( data.css, getFileExtensionFromPreprocessor( data.preprocessor ) );
	} );
}

function getFileExtensionFromPreprocessor( value ) {
	var cssType = 'css';
	if ( value === 'sass' ) {
		cssType = 'scss';
	}
	if ( value === 'less' ) {
		cssType = 'less';
	}
	return cssType;
}

function downloadPages() {
	var site = Site.getSite();
	var wpcomPostList = q.nbind( site.postsList, site );

	return wpcomPostList( { type: 'page', status: 'publish' } )
	.catch( function( err ) {
		console.error( 'Error while downloading posts:', err );
		throw new Error( 'Error while downloading posts' );
	} )
	.then( function( list ) {
		if ( ! list.posts ) {
			debug( 'no posts in post list response' );
			throw new Error( 'Error: no posts in post list response' );
		}
		return createPostsDirectory()
		.then( function() {
			return writePostsToFiles( list.posts );
		} );
	} );
}

function writePostsToFiles( posts ) {
	return q.all( posts.map( writePostToFile ) );
}

function writePostToFile( post ) {
	debug( 'preparing to save data for post', post.title );
	return q.all( [ writePostJsonToFile( post ), writeHtmlToFile( post ) ] );
}

function writePostJsonToFile( post ) {
	var jsonFilename = path.join( getPostsDirectory(), post.slug + '.json' );
	console.log( 'writing', jsonFilename );
	return writeFile( jsonFilename, Post.postToString( post ) );
}

function writeHtmlToFile( post ) {
	var htmlFilename = path.join( getPostsDirectory(), post.slug + '.html' );
	console.log( 'writing', htmlFilename );
	return writeFile( htmlFilename, Post.postToContent( post ) );
}

function writeCssToFile( css, type ) {
	type = type || 'css';
	var filename = path.join( getSiteDirectory(), 'customcss.' + type );
	console.log( 'writing', filename );
	return writeFile( filename, css );
}

function getSiteDirectory() {
	return Site.getSiteDirectory();
}

function getPostsDirectory() {
	return path.join( getSiteDirectory(), 'posts' );
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
