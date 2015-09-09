// External dependencies
var wpcom = require( 'wpcom' )();

var siteUrl,
	wpcomSite;

var Site = {

	connect: function( url ) {
		siteUrl = url;
		wpcomSite = wpcom.site( url );
	},

	getUrl: function() {
		return siteUrl;
	},

	getSite: function() {
		return wpcomSite;
	}

};

module.exports = Site;

