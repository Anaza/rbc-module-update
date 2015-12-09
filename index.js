/**
 * There is also "rbc amd update" task for gulp
 */
'use strict';

module.exports = function( scriptsDirName ) {
    updateWidgets( scriptsDirName );

};

// ==========================================================================
// UPDATE FUNCTIONS
// ==========================================================================

function updateWidgets( scriptsDirName ) {
    var fs = require( 'fs' ),
        path = require( 'path' ),
        widgets = getDirs( scriptsDirName + '/widgets' );

    if ( widgets.length === 0 ) {
        var mkdirSync = function (path) {
            try {
                fs.mkdirSync(path);
            } catch(e) {
                if ( e.code != 'EEXIST' ){ throw e; }
            }
        };

        mkdirSync(scriptsDirName + '/widgets' );

        fs.writeFileSync( path.normalize(scriptsDirName+'/widgets/__main.js'), '' );
        return;
    }

    var mainjs = [
          getDeps({
            items: widgets,
            separator: '\n'
          }),
          '\n\n',
          'module.exports = (function() {\n',
          '    function init() {\n',
                 getWidgetsInitialization( widgets ),
          '    }\n\n',
          '    return {\n',
               '        init: init\n',
          '    };\n',
          '})();'
        ].join( '' );

    fs.writeFileSync( path.normalize(scriptsDirName+'/widgets/__main.js'), mainjs );
}

// ==========================================================================
// WIDGETS
// ==========================================================================

function getWidgetsInitialization( widgets ) {
    var inits = [];

    widgets.map(function( widget ) {
        var template = [
            '        if ( ' + getJSname(widget) + '.shouldRun() === true ) {\n',
            '            ' + getJSname(widget) + '.init();\n',
            '        }\n'
        ].join( '' );

        inits.push( template );
    });

    return inits.join( '\n' );
}

// ==========================================================================
// HELPERS
// ==========================================================================

function getDirs( dir ) {
    var fs = require( 'fs' ),
        path = require( 'path' ),
        dirs = [];

    dir = path.normalize( dir );


    try {
        var items = fs.readdirSync( dir );
    } catch( err ) {
        return [];
    }

    items.map(function( item ) {
        var itemPath = path.normalize( dir + '/' + item );

        // should be a directory and not UNIX hidden directory
        if ( fs.lstatSync( itemPath ).isDirectory() && item.charAt(0) !== '.' ) {
            dirs.push( item );
        }
    });

    dirs.sort();

    return dirs;
}

function capitaliseFirstLetter( string ) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getJSname( name ) {
    name = name.split( '-' );

    var first = name.shift(),
        parts = [];

    name.map(function( part ) {
        parts.push( capitaliseFirstLetter( part ) );
    });

    return ( first + parts.join( '' ) );
}

function getDeps( params ) {
    var deps = [],
        items = params.items;

    items.map(function( item ) {
        deps.push( 'var ' + getJSname(item) + ' = require(\'./' + item + '/main\');');
    });

    return deps.join( params.separator );
}
