var fs = require( 'fs' );
var q = require( 'q' );

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

function postToString( post ) {
	var propertiesToCopy = [ 'title', 'likes_enabled', 'discussion', 'page_template', 'date', 'status', 'type', 'post_thumbnail', 'sticky', 'slug', 'sharing_enabled', 'featured_image', 'content' ];
	var postToSave = propertiesToCopy.reduce( function( prev, key ) {
		if ( typeof post[ key ] !== 'undefined' ) {
			prev[ key ] = post[ key ];
		}
		return prev;
	}, {} );
	return JSON.stringify( postToSave );
}

module.exports = downloadSite;
