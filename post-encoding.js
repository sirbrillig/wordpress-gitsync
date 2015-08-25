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

module.exports = {
	postToString: postToString
};
