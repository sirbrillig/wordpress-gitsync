// External dependencies
var fs = require( 'fs' ),
	path = require( 'path' ),
	debug = require( 'debug' )( 'warp:styles' ),
	q = require( 'q' );

// Internal dependencies
var Site = require( './site' );

// Promisify functions
var doesFileExist = q.nbind( fs.readFile, fs ),
	readFile = q.nbind( fs.readFile, fs );

var css,
	filename = '',
	preprocessor = '';

function buildFilename( suffix ) {
	return path.join( Site.getSiteDirectory(), 'customcss.' + suffix );
}

function saveCss( newCss ) {
	css = newCss;
}

function savePreprocessor( newVal ) {
	preprocessor = newVal;
}

function saveFilename( newVal ) {
	filename = newVal;
}

var Styles = {

	getStyles: function() {
		return css;
	},

	getPreprocessor: function() {
		return preprocessor;
	},

	readStyles: function() {
		if ( ! filename ) {
			throw new Error( 'No styles filename saved' );
		}
		return readFile( filename, { encoding: 'utf8' } )
		.then( function( contents ) {
			if ( ! contents ) {
				debug( 'error after reading file', filename );
				throw new Error( 'Error after reading styles file' );
			}
			debug( 'read file contents from', filename );
			saveCss( contents );
		} )
		.catch( function() {
			debug( 'error reading file', filename );
			throw new Error( 'Error while reading styles file' );
		} );
	},

	findFilename: function() {
		var suffix = 'css';
		debug( 'trying filename with suffix', suffix );
		return doesFileExist( buildFilename( suffix ) )
		.catch( function() {
			suffix = 'less';
			debug( 'trying filename with suffix', suffix );
			return doesFileExist( buildFilename( suffix ) );
		} )
		.catch( function() {
			suffix = 'scss';
			debug( 'trying filename with suffix', suffix );
			return doesFileExist( buildFilename( suffix ) );
		} )
		.catch( function() {
			debug( 'no css filename found' );
			throw new Error( 'Error: no styles file found' );
		} )
		.then( function() {
			savePreprocessor( suffix );
			saveFilename( buildFilename( suffix ) );
			debug( 'found css filename', filename );
		} );
	},

	getFilename: function() {
		return filename;
	}

};

module.exports = Styles;

