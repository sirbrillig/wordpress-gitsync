// External dependencies
var wpcom = require( 'wpcom' )(),
	fs = require( 'fs' ),
	debug = require( 'debug' )( 'wpgs:download' ),
	q = require( 'q' );

// Promisify wpcom functions
var wpcomGet = q.nbind( wpcom.req.get, wpcom.req );

// Internal dependencies
var Post = require( './post-encoding' ),
	Site = require( './site' );

function downloadSite() {
	debug( 'downloadSite', Site.getUrl() );
	createSiteDirectory().then( function() {
		downloadPages( Site.getSite() );
		downloadCss();
	} );
}

function downloadCss() {
	debug( 'downloadCss', Site.getUrl() );
	wpcomGet( '/sites/' + Site.getUrl() + '/customcss' )
	.fail( function( err ) {
		console.error( err );
	} )
	.then( function( data ) {
		var cssType = 'css';
		if ( ! data.css ) {
			return;
		}
		if ( data.preprocessor === 'sass' ) {
			cssType = 'scss';
		}
		if ( data.preprocessor === 'less' ) {
			cssType = 'less';
		}
		writeCssToFile( data.css, cssType );
	} );
}

function downloadPages( site ) {
	var wpcomPostList = q.nbind( site.postsList, site );
	wpcomPostList( { type: 'page', status: 'publish' } )
	.fail( function( err ) {
		console.error( err );
	} )
	.then( function( list ) {
		if ( ! list.posts ) {
			return;
		}
		createPostsDirectory().then( function() {
			writePostsToFiles( list.posts );
		} );
	} );
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
	fs.writeFile( filename, css );
}

function getSiteDirectory() {
	return Site.getUrl();
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
