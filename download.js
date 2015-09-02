var wpcom = require( 'wpcom' )();

var fs = require( 'fs' ),
	debug = require( 'debug' )( 'wpgs:download' ),
	q = require( 'q' );

var postToString = require( './post-encoding' ).postToString;

var siteUrl = 'unknown_site';

function downloadSite( site ) {
	siteUrl = site._id;
	debug( 'downloadSite', siteUrl );
	createSiteDirectory().then( function() {
		downloadPages( site );
		downloadCss();
	} );
}

function downloadCss() {
	debug( 'downloadCss', siteUrl );
	q.ninvoke( wpcom.req, 'get', '/sites/' + siteUrl + '/customcss' )
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
	q.ninvoke( site, 'postsList', { type: 'page', status: 'publish' } )
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
	var filename = getPostsDirectory() + '/' + post.slug + '.json';
	console.log( 'writing', filename );
	fs.writeFile( filename, postToString( post ) );
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
	return siteUrl;
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
