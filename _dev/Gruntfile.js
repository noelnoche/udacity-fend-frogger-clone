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
    cssmin: {
      target: {
        files: {
          
          // 'outputFile' : ['analyzedFile']
          '../css/main.css': ['app/css/main.css']
        }
      }
    },

    // Deletes specified folders, files, etc.
    // npmjs.com/package/grunt-contrib-clean
    clean: {
      files: ['app/js/modules/main.js', 'app/js/bundle.js'],
    },
    
    // Concatenates specified JS files
    // npmjs.com/package/grunt-contrib-concat
    concat: {
      options: {
        separator: '/* xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx */',
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
        } , {
          expand: true,
          cwd: 'app/docs',
          src: '**',
          dest: '../'
        }, {
          expand: true,
          cwd: 'app/js/vendor',
          src: '**',
          dest: '../js/vendor/'
        }, {
          expand: true,
          cwd: 'app/js',
          src: 'app/js/bundle.js',
          dest: '../js/'
        }],
      },
    },
    
    // Minifies HTML code
    // npmjs.com/package/grunt-contrib-htmlmin
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: false,
          minifyCSS: false
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
        ignores: ['app/js/bundle.js'],
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
        src: ['app/js/modules/*.js', 'app/js/*.js']
      },
      
      // Run on individual modules and concatenated `main.js` file
      // to avoid linting warnings with 'use strict'
      afterconcat: ['app/js/modules/*.js']
    },
    
    // Applies specified css post-processers
    // npmjs.com/package/grunt-postcss
    postcss: {
      options: {
        map: {
          inline: false,
          annotation: '_map/'
        },
        
        processors: [
          require('pixrem')(), // Adds fallbacks for rem units 
          require('autoprefixer')({
            browserlist: 'last 2 versions'
          }) // Adds vendor prefixes 
        ]
      },
      
      dist: {
        src: 'app/css/main.css'
      }
    },
    
    // Minifies JS
    // npmjs.com/package/grunt-contrib-uglify
    uglify: {
      options: {
        mangle: true,
        nameCache: '_map/grunt-uglify-cache.json',
        sourceMap: true,
        sourceMapName: '_map/sourcemap.map'
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
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-postcss');

  /** CUSTOM TASKS **/
  grunt.registerTask('default', ['concat', 'browserify', 'jshint:afterconcat']);
  grunt.registerTask('dist', ['concat', 'browserify', 'uglify', 'copy', 'postcss', 'cssmin', 'htmlmin', 'clean:files']);
};
