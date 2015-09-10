// External dependencies
var wpcom = require( 'wpcom' )(),
	parseUrl = require( 'url' ).parse;

var siteUrl,
	wpcomSite;

var Site = {

	connect: function( url ) {
		siteUrl = url;
		wpcomSite = wpcom.site( url );
	},

	getSiteDirectory: function() {
		return parseUrl( wpcomSite ).hostname;
	},

	getUrl: function() {
		return siteUrl;
	},

	getSite: function() {
		return wpcomSite;
	}

};

module.exports = Site;

