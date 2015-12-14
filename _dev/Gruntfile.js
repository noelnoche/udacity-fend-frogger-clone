module.exports = function(grunt) {
	"use strict";

	/** PROJECT CONFIGURATION **/
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		// Concatenates specified JS files
		// Then, on terminal: $ browserify [projectName]/_dev/js/browserify/main.js > [projectName]/js/browserify/bundle.js
		concat: {
			options: {
				separator: "\n/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */\n",
			},
			dist: {
				src: ["project-03/_dev/js/resources.js",
							"project-03/_dev/js/hud.js",
							"project-03/_dev/js/components.js",
							"project-03/_dev/js/tile.js",
							"project-03/_dev/js/gem.js",
							"project-03/_dev/js/enemies.js",
							"project-03/_dev/js/player.js",
							"project-03/_dev/js/initializer.js",
							"project-03/_dev/js/levels.js",
							"project-03/_dev/js/engine.js"],
				dest: "project-03/_dev/processed/app-dev.concat.js"
			}
		},

		// Checks for errors and redundancy in JavaScript code.
		jshint: {
			options: {
				force: true
			},

			// Files to apply code linting.
			files: ["project-03/_dev/browserify/app-dev.concat.js"]
		},

		// Minifies JS.
		uglify: {
			options: {
				mangle: true,
				sourceMap: false,
				nameCache: "project-03/_dev/_ignore/grunt-uglify-cache.json"
			},
			my_target: {

				// "outputFile" : ["analyzedFile"]
				files: {
					"project-03/bundle.min.js": ["project-03/_dev/js/browserify/bundle.js"]
				}
			}
		},

		// Minifies HTML code.
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					minifyJS: true,
					minifyCSS: true
				},
				files: {

					// "destinationFile" : "sourceFile" 
					"project-03/index.html":"project-03/_dev/index.html"
				}
			}
		}
	});

	/** DEPENDENT PLUGINS **/
	// grunt.loadNpmTasks("");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-htmlmin");


	/** DEFAULT TASKS **/
	grunt.registerTask("build", ["uglify", "htmlmin"]);
};