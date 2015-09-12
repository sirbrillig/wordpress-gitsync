// External dependencies
var parseUrl = require( 'url' ).parse;

var siteUrl,
	siteDirectory;

var Site = {

	connect: function( url ) {
		siteUrl = url;
	},

	setSiteDirectory: function( directory ) {
		siteDirectory = directory;
	},

	getSiteHostname: function() {
		return parseUrl( siteUrl ).hostname || siteUrl;
	},

	getSiteDirectory: function() {
		return siteDirectory || Site.getSiteHostname();
	},

	getUrl: function() {
		return siteUrl;
	}

};

module.exports = Site;

