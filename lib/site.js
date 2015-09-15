// External dependencies
var parseUrl = require( 'url' ).parse;

var siteUrl,
	siteHostname,
	siteDirectory;

var Site = {

	setSiteUrl: function( url ) {
		siteUrl = url;
		siteHostname = parseUrl( siteUrl ).hostname || siteUrl;
	},

	setSiteDirectory: function( directory ) {
		siteDirectory = directory;
	},

	getSiteHostname: function() {
		return siteHostname;
	},

	getSiteDirectory: function() {
		return siteDirectory || Site.getSiteHostname();
	},

	getUrl: function() {
		return siteUrl;
	}

};

module.exports = Site;

