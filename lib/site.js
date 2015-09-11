// External dependencies
var wpcom = require( 'wpcom' )(),
	debug = require( 'debug' )( 'warp:site' ),
	parseUrl = require( 'url' ).parse;

var siteUrl,
	siteDirectory,
	wpcomSite;

var Site = {

	connect: function( url ) {
		siteUrl = url;
		wpcomSite = wpcom.site( url );
		debug( 'site connect complete for', siteUrl );
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
	},

	getSite: function() {
		return wpcomSite;
	}

};

module.exports = Site;

