var fs = require( 'fs' );
var q = require( 'q' );

function downloadSite( site ) {
	downloadPages( site );
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

function getPostsDirectory() {
	return 'posts';
}

function createPostsDirectory() {
	var directory = getPostsDirectory();
	return q.nfcall( fs.mkdir, directory );
}

function postToString( post ) {
	return JSON.stringify( post );
}

module.exports = downloadSite;
