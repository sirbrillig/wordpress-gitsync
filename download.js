var fs = require( 'fs' ),
	q = require( 'q' );

var postToString = require( './post-encoding' ).postToString;

var siteUrl = 'unknown_site';

function downloadSite( site ) {
	siteUrl = site._id;
	createSiteDirectory().then( function() {
		downloadPages( site );
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

function getSiteDirectory() {
	return siteUrl;
}

function getPostsDirectory() {
	return getSiteDirectory() + '/posts';
}

function createSiteDirectory() {
	return q.nfcall( fs.mkdir, getSiteDirectory() );
}

function createPostsDirectory() {
	return q.nfcall( fs.mkdir, getPostsDirectory() );
}

module.exports = downloadSite;
