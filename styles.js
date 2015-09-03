// External dependencies
var fs = require( 'fs' ),
	debug = require( 'debug' )( 'wpgs:styles' ),
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
	return Site.getUrl() + '/customcss.' + suffix;
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
		var promise = q.defer();
		if ( css ) {
			promise.resolve();
			return promise.promise;
		}
		if ( ! filename ) {
			promise.reject();
			return promise.promise;
		}
		readFile( filename, { encoding: 'utf8' } )
		.then( function( contents ) {
			if ( ! contents ) {
				debug( 'error after reading file', filename );
				return promise.reject();
			}
			debug( 'read file contents from', filename );
			saveCss( contents );
			return promise.resolve();
		} )
		.catch( function() {
			debug( 'error reading file', filename );
			return promise.reject();
		} );
		return promise.promise;
	},

	findFilename: function() {
		var promise = q.defer(),
			suffix = 'css';
		if ( filename && preprocessor ) {
			debug( 'returning cached filename', filename );
			promise.resolve();
			return promise.promise;
		}
		debug( 'trying filename with suffix', suffix );
		doesFileExist( buildFilename( suffix ) )
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
			return promise.reject();
		} )
		.then( function() {
			savePreprocessor( suffix );
			saveFilename( buildFilename( suffix ) );
			debug( 'found css filename', filename );
			promise.resolve();
		} );
		return promise.promise;
	}

};

module.exports = Styles;

