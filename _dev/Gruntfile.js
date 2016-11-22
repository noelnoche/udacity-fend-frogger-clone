module.exports = function(grunt) {

  'use strict';

  /** PROJECT CONFIGURATION **/
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Applies Browserify
    // npmjs.com/package/grunt-browserify
    browserify: {
      dist: {
        files: {
          'app/js/bundle.js': ['app/js/modules/main.js']
        }
      }
    },

    // Minifies CSS
    // npmjs.com/package/grunt-contrib-cssmin
    // cssmin: {
    //   target: {
    //     files: {

    //       // 'outputFile' : ['analyzedFile']
    //       '': ['']
    //     }
    //   }
    // },

    // Concatenates specified JS files
    // npmjs.com/package/grunt-contrib-concat
    concat: {
      options: {
        separator: '/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */',
      },

      dist: {
        src: ['app/js/hud.js',
          'app/js/tile.js',
          'app/js/gem.js',
          'app/js/enemies.js',
          'app/js/player.js',
          'app/js/levels.js',
          'app/js/engine.js'
        ],
        dest: 'app/js/modules/main.js'
      }
    },

    // Starts a connect web server
    // npmjs.com/package/grunt-contrib-connect
    // https://funkycold.wordpress.com/2015/02/28/learning-grunt-grunt-contrib-connect/
    connect: {
      server: {
        options: {
          port: 8000,
          hostname: '0.0.0.0',
          keepalive: true
        }
      }
    },

    // Duplicates files and folders
    // npmjs.com/package/grunt-contrib-copy
    copy: {
      main: {
        files: [{
          expand: true,
          cwd: 'app/',
          src: 'index.html',
          dest: '../'
        }, {
          expand: true,
          cwd: 'app/assets',
          src: '**',
          dest: '../assets/'
        }, {
          expand: true,
          cwd: 'app/docs',
          src: '**',
          dest: '../'
        }, {
          expand: true,
          cwd: 'bower_components/jquery/dist/',
          src: 'jquery.min.js',
          dest: '../js'
        }],
      },
    },

    // Deletes specified folders, files, etc.
    // npmjs.com/package/grunt-contrib-clean
    clean: {
      files: ['app/js/modules/main.js', 'app/js/bundle.js']
    },

    // Minifies HTML code
    // npmjs.com/package/grunt-contrib-htmlmin
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true,
          minifyCSS: true
        },

        files: {

          // 'destinationFile' : 'sourceFile'
          '../index.html': '../index.html'
        }
      }
    },

    // Checks for errors and redundancy in JavaScript code
    // npmjs.com/package/grunt-contrib-jshint
    // jshint.com/docs/options/
    jshint: {
      options: {
        force: true,
        strict: 'global',
        globals: {
          'module': true,
          'require': true,
          '$': true,
          'window': true,
          'document': true,
          'Image': true,
          'Audio': true,
          'console': true,
          'clearTimeout': true
        },
        reporter: require('jshint-stylish')
      },

      files: {
        src: ['app/js/modules/*.js']
      }
    },

    // Applies specified css post-processers
    // npmjs.com/package/grunt-postcss
    postcss: {
      options: {
        map: {
          inline: false,
          annotation: '_ignore/'
        },

        processors: [
          require('pixrem')(), // Adds fallbacks for rem units 
          require('autoprefixer')({
            browsers: 'last 2 versions'
          }) // Adds vendor prefixes 
        ]
      },

      dist: {
        src: 'app/css/*.css'
      }
    },

    // Alters file paths in html file
    // npmjs.com/package/grunt-processhtml
    processhtml: {
      dist: {
        files: {

          // 'outputFile' : ['analyzedFile']
          '../index.html': ['app/index.html']
        }
      }
    },

    // Minifies JS
    // npmjs.com/package/grunt-contrib-uglify
    uglify: {
      options: {
        mangle: true,
        nameCache: '_ignore/grunt-uglify-cache.json',
        sourceMap: true,
        sourceMapName: '_ignore/sourcemap.map'
      },

      my_target: {

        // 'outputFile' : ['analyzedFile']
        files: {
          '../js/bundle.js': ['app/js/bundle.js']
        }
      }
    }
  });

  /** DEPENDENT PLUGINS **/
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-processhtml');

  /** CUSTOM TASKS **/
  grunt.registerTask('default', ['concat', 'browserify', 'jshint']);
  grunt.registerTask('dist', ['concat', 'browserify', 'uglify', 'copy', 'processhtml', 'htmlmin', 'clean:files']);
};
