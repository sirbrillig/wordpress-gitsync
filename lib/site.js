// External dependencies
var wpcom = require( 'wpcom' )(),
	debug = require( 'debug' )( 'wpgs:site' ),
	parseUrl = require( 'url' ).parse;

var siteUrl,
	wpcomSite;

var Site = {

	connect: function( url ) {
		siteUrl = url;
		wpcomSite = wpcom.site( url );
		debug( 'site connect complete for', siteUrl );
	},

	getSiteDirectory: function() {
		return parseUrl( siteUrl ).hostname || siteUrl;
	},

	getUrl: function() {
		return siteUrl;
	},

	getSite: function() {
		return wpcomSite;
	}

};

module.exports = Site;

