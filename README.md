# rbc-module-update
Update pages and widgets dependencies for browserify.
Takes paths.scripts.src path, checks for `widgets` dependencies and generates `__main.js`.

# Installation
npm install rbc-module-update --save-dev

# Use
var rbcUpdate = require('rbc-module-update');

rbcUpdate( 'paths.scripts.src' );
