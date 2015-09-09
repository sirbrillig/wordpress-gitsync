function filterPostFor( post, propertiesToCopy ) {
	propertiesToCopy = propertiesToCopy || [];
	return propertiesToCopy.reduce( function( prev, key ) {
		if ( typeof post[ key ] !== 'undefined' ) {
			prev[ key ] = post[ key ];
		}
		return prev;
	}, {} );
}

function postToContent( post ) {
	return post.content;
}

function postToString( post ) {
	var postToSave = filterPostFor( post, [ 'title', 'likes_enabled', 'discussion', 'page_template', 'date', 'status', 'type', 'post_thumbnail', 'sticky', 'slug', 'sharing_enabled', 'featured_image' ] );
	return JSON.stringify( postToSave );
}

module.exports = {
	postToContent: postToContent,
	postToString: postToString
};
