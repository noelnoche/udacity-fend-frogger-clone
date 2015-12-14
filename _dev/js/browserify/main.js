// Browserify everything into a single variable.
var App = (function(global) {
	require("./app-dev.concat.js");
})(this);