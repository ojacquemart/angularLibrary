var markdown = require('node-markdown').Markdown;

module.exports = function (grunt) {

   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-conventional-changelog');
   grunt.loadNpmTasks('grunt-bump');
   grunt.loadNpmTasks('grunt-karma');
   grunt.loadNpmTasks('grunt-ngdocs');
   grunt.loadNpmTasks('grunt-html2js');
   grunt.loadNpmTasks("grunt-encode-images");

   // Project configuration.
   grunt.util.linefeed = '\n';

   grunt.initConfig({
      modules: [], //to be filled in by build task
      pkg: grunt.file.readJSON('package.json'),
      dist: 'dist',
      filename: 'angular-library',
      meta: {
         banner: '/**\n' +
            ' * <%= pkg.description %>\n' +
            ' * @version v<%= pkg.version %><%= buildtag %>\n' +
            ' * @link <%= pkg.homepage %>\n' +
            ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
            ' */',
         modules: 'angular.module("angular.library", [<%= srcModules %>]);',
         tplmodules: 'angular.module("angular.library.tpls", [<%= tplModules %>]);',
         all: 'angular.module("angular.library", ["angular.library.tpls", <%= srcModules %>]);'
      },
      delta: {
         docs: {
            files: ['misc/demo/index.html'],
            tasks: ['after-test']
         },
         html: {
            files: ['src/js/**/*.tpl.html'],
            tasks: ['html2js', 'karma:watch:run']
         },
         js: {
            files: ['src/js/**/*.js'],
            tasks: ['karma:watch:run']
         }
      },
      concat: {
         dist_tpls: {
            options: {
               banner: '<%= meta.banner %>\n<%= meta.all %>\n<%= meta.tplmodules %>\n'
            },
            src: [], //src filled in by build task
            dest: '<%= dist %>/js/<%= filename %>-tpls.js'
         }
      },
      uglify: {
         options: {
            banner: '<%= meta.banner %>'
         },
         dist_tpls: {
            src: ['<%= dist %>/js/<%= filename %>-tpls.js'],
            dest: '<%= dist %>/js/<%= filename %>-tpls.min.js'
         }
      },
      encodeImages: {
         build: {
            files: [
               {
                  expand: true,
                  cwd: 'src/css/',
                  src: '**/*.css',
                  dest: 'dist/css/'
               }
            ]
         }
      },
      html2js: {
         dist: {
            options: {
               module: null, // no bundle module for all the html2js templates
               base: '.'
            },
            files: [
               {
                  expand: true,
                  src: ['src/js/**/*.tpl.html'],
                  ext: '.html.js'
               }
            ]
         }
      },
      jshint: {
         files: ['Gruntfile.js', 'src/**/*.js'],
         options: {
            node: true,
            curly: true,
            immed: true,
            newcap: true,
            noarg: true,
            sub: true,
            boss: true,
            eqnull: true,
            globals: {
               angular: true
            }
         }
      },
      karma: {
         options: {
            configFile: 'karma.conf.js'
         },
         watch: {
            background: true
         },
         continuous: {
            singleRun: true
         },
         jenkins: {
            singleRun: true,
            colors: false,
            reporter: ['dots', 'junit'],
            browsers: ['Chrome', 'ChromeCanary', 'Firefox', 'Opera', '/Users/jenkins/bin/safari.sh', '/Users/jenkins/bin/ie9.sh']
         },
         travis: {
            singleRun: true,
            browsers: ['Firefox']
         }
      },
      clean: {
         dist: {
            dot: true,
            src: [
               '.tmp',
               'dist/*'
            ]
         }
      },
      bump: {
         options: {
            files: [ 'package.json', 'bower.json' ],
            updateConfigs: [ 'pkg' ],
            commitMessage: 'chore(release): v%VERSION%',
            commitFiles: [ 'package.json', 'bower.json', 'dist', 'CHANGELOG.md' ],
            pushTo: 'origin'
         }
      },
      changelog: {
         options: {
            dest: 'CHANGELOG.md',
            templateFile: 'misc/changelog.tpl.md'
         }
      }
   });

   //register before and after test tasks so we've don't have to change cli
   //options on the goole's CI server
   grunt.registerTask('before-test', [ 'jshint', 'html2js']);
   grunt.registerTask('after-test', [ 'clean:dist', 'build', 'encodeImages']);

   //Rename our watch task to 'delta', then make actual 'watch'
   //task build things, then start test server
   grunt.renameTask('watch', 'delta');
   grunt.registerTask('watch', ['before-test', 'after-test', 'karma:watch', 'delta']);

   grunt.registerTask('default', ['before-test', 'test', 'after-test']);

   grunt.registerTask('prepare-release', [ 'bump-only' ]);
   grunt.registerTask('dist', [ 'default'  ]);
   grunt.registerTask('perform-release', [ 'bump-commit' ]);
   grunt.registerTask('release', [ 'prepare-release', 'dist', 'changelog', 'perform-release' ]);

   /**
    * Browse a directory to search for modules.
    */
   function browse(directory) {
      grunt.file.expand({
         filter: 'isDirectory', cwd: '.'
      }, 'src/js/' + directory + '/*').forEach(function (dir) {
            var split = dir.split('/');
            var dirToScan = split[split.length - 1];
            findModule(directory, dirToScan);
         });
   }

   // To memoize modules.
   var foundModules = {};

   /**
    * Adds a given module to config based on its directory.
    * @param directory the module directory.
    * @param moduleName the module moduleName.
    */
   function findModule(directory, moduleName) {
      var fullModuleName = directory+'/'+moduleName;
      if (foundModules[fullModuleName]) {
         return;
      }
      foundModules[fullModuleName] = true;

      grunt.log.ok('Find module ' + fullModuleName);

      function breakup(text, separator) {
         return text.replace(/[A-Z]/g, function (match) {
            return separator + match;
         });
      }

      function ucwords(text) {
         return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
            return $1.toUpperCase();
         });
      }

      function enquote(str) {
         return '"' + str + '"';
      }

      var baseDir = "src/js/" + directory + "/" + moduleName + '/';
      var module = {
         name: moduleName,
         moduleName: enquote('angular.library.' + directory + '.' + moduleName),
         displayName: ucwords(breakup(moduleName, ' ')),
         srcFiles: grunt.file.expand(baseDir + "*.js").filter(function (name) {
            return !name.match(/.spec.js$/);
         }),
         tplFiles: grunt.file.expand(baseDir + "*.tpl.html"),
         tpljsFiles: grunt.file.expand(baseDir + "*.html.js"),
         tplModules: grunt.file.expand(baseDir + "*.tpl.html").map(enquote)
      };
      grunt.config('modules', grunt.config('modules').concat(module));
   }

   /**
    * The build tasks concat and uglify js sources and templates files.
    */
   grunt.registerTask('build', 'Create bootstrap build files', function () {
      browse('directives');
      browse('services');

      var modules = grunt.config('modules');
      var _ = grunt.util._;
      grunt.config('srcModules', _.pluck(modules, 'moduleName'));
      grunt.config('tplModules', _.pluck(modules, 'tplModules').filter(function (tpls) {
         return tpls.length > 0;
      }));

      var srcFiles = _.pluck(modules, 'srcFiles');
      var tpljsFiles = _.pluck(modules, 'tpljsFiles');

      // Set the concat-with-templates task to concat the given src & tpl modules
      grunt.config('concat.dist_tpls.src', grunt.config('concat.dist_tpls.src')
         .concat(srcFiles).concat(tpljsFiles));

      grunt.task.run(['concat', 'uglify']);
   });

   /**
    * This task can be executed in 3 different environments: local, Travis-CI and Jenkins-CI
    * we need to take settings for each one into account
    */
   grunt.registerTask('test', 'Run tests on singleRun karma server', function () {
      if (process.env.TRAVIS) {
         grunt.task.run('karma:travis');
      } else {
         grunt.task.run(this.args.length ? 'karma:jenkins' : 'karma:continuous');
      }
   });

   return grunt;
};