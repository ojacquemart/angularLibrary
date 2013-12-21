var markdown = require('node-markdown').Markdown;

module.exports = function(grunt) {

   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-html2js');
   grunt.loadNpmTasks('grunt-karma');
   grunt.loadNpmTasks('grunt-conventional-changelog');
   grunt.loadNpmTasks('grunt-ngdocs');
   grunt.loadNpmTasks("grunt-encode-images");
   grunt.loadNpmTasks('grunt-bump');

   // Project configuration.
   grunt.util.linefeed = '\n';

   grunt.initConfig({
      modules: [],//to be filled in by build task
      pkg: grunt.file.readJSON('package.json'),
      dist: 'dist',
      filename: 'angular-library',
      filenamecustom: '<%= filename %>-custom',
      clean: {
         dist: {
            dot: true,
            src: [
               '.tmp',
               'dist/*',
               'dist/.git*'
            ]
         }
      },
      bump: {
         options: {
            files: ['package.json', 'bower.json' ],
            commitMessage: 'chore(release): v%VERSION%',
            commitFiles: ['-a' ],
            pushTo: 'origin'
         }
      },
      meta: {
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
            //we don't need to jshint here, it slows down everything else
            tasks: ['karma:watch:run']
         }
      },
      concat: {
         dist: {
            options: {
               banner: '<%= meta.modules %>\n'
            },
            src: [], //src filled in by build task
            dest: '<%= dist %>/js/<%= filename %>-<%= pkg.version %>.js'
         },
         dist_tpls: {
            options: {
               banner: '<%= meta.all %>\n<%= meta.tplmodules %>\n'
            },
            src: [], //src filled in by build task
            dest: '<%= dist %>/js/<%= filename %>-tpls-<%= pkg.version %>.js'
         }
      },
      encodeImages: {
         build: {
            files: [{
               expand: true,
               cwd: 'src/css/',
               src: '**/*.css',
               dest: 'dist/css/'
            }]
         }
      },
      uglify: {
         dist:{
            src:['<%= dist %>/js/<%= filename %>-<%= pkg.version %>.js'],
            dest:'<%= dist %>/js/<%= filename %>-<%= pkg.version %>.min.js'
         },
         dist_tpls:{
            src:['<%= dist %>/js/<%= filename %>-tpls-<%= pkg.version %>.js'],
            dest:'<%= dist %>/js/<%= filename %>-tpls-<%= pkg.version %>.min.js'
         }
      },
      html2js: {
         dist: {
            options: {
               module: null, // no bundle module for all the html2js templates
               base: '.'
            },
            files: [{
               expand: true,
               src: ['src/js/**/*.tpl.html'],
               ext: '.html.js'
            }]
         }
      },
      jshint: {
         files: ['Gruntfile.js','src/**/*.js'],
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
      changelog: {
         options: {
            dest: 'CHANGELOG.md',
            templateFile: 'misc/changelog.tpl.md',
            github: 'angular-ui/bootstrap'
         }
      },
      shell: {
         'git-add': [
            'git add dist'
         ],
         //We use %version% and evluate it at run-time, because <%= pkg.version %>
         //is only evaluated once
         'release-prepare': [
            'grunt before-test after-test',
            'grunt version', //remove "-SNAPSHOT"
            'grunt changelog'
         ],
         'release-complete': [
            'git commit CHANGELOG.md package.json -m "chore(release): v%version%"',
            'git tag %version%'
         ],
         'release-start': [
            'grunt version:minor:"SNAPSHOT"',
            'git commit package.json -m "chore(release): Starting v%version%"'
         ]
      },
      ngdocs: {
         options: {
            dest: 'dist/docs',
            scripts: [
               'angular.js',
               '<%= concat.dist_tpls.dest %>'
            ],
            styles: [
               'docs/css/style.css'
            ],
            navTemplate: 'docs/nav.html',
            title: 'angular-library',
            html5Mode: false
         },
         api: {
            src: ["src/**/*.js", "src/**/*.ngdoc"],
            title: "API Documentation"
         }
      }
   });

   //register before and after test tasks so we've don't have to change cli
   //options on the goole's CI server
   grunt.registerTask('before-test', ['enforce', 'jshint', 'html2js']);
   grunt.registerTask('after-test', ['build', 'encodeImages']);

   //Rename our watch task to 'delta', then make actual 'watch'
   //task build things, then start test server
   grunt.renameTask('watch', 'delta');
   grunt.registerTask('watch', ['before-test', 'after-test', 'karma:watch', 'delta']);

   // Default task.
   grunt.registerTask('default', ['before-test', 'test', 'after-test']);

   grunt.registerTask('enforce', 'Install commit message enforce script if it doesn\'t exist', function() {
      if (!grunt.file.exists('.git/hooks/commit-msg')) {
         grunt.file.copy('misc/validate-commit-msg.js', '.git/hooks/commit-msg');
         require('fs').chmodSync('.git/hooks/commit-msg', '0755');
      }
   });

   function browse(dirName) {
      grunt.file.expand({
         filter: 'isDirectory', cwd: '.'
      }, 'src/js/' + dirName + '/*').forEach(function(dir) {
            var split = dir.split('/');
            var dirToScan = split[split.length - 1];
            findModule(dirName, dirToScan);
         });
   }

   //Common angular.library module containing all modules for src and templates
   //findModule: Adds a given module to config
   var foundModules = {};
   function findModule(dir, name) {
      if (foundModules[name]) { return; }
      foundModules[name] = true;

      grunt.log.ok('Find module ' + dir + '/' + name);

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

      var baseDir = "src/js/" + dir + "/" + name + '/';
      var module = {
         name: name,
         moduleName: enquote('angular.library.' + dir + '.' + name),
         displayName: ucwords(breakup(name, ' ')),
         // Remove specs file from sources.
         srcFiles: grunt.file.expand(baseDir + "*.js").filter(function(name) { return !name.match(/.spec.js$/); }),
         tplFiles: grunt.file.expand(baseDir + "*.tpl.html"),
         // .html.js files are generated by html2js.
         tpljsFiles: grunt.file.expand(baseDir + "*.html.js"),
         tplModules: grunt.file.expand(baseDir + "*.tpl.html").map(enquote)
      };
      grunt.config('modules', grunt.config('modules').concat(module));
   }

   grunt.registerTask('dist', 'Override dist directory', function() {
      var dir = this.args[0];
      if (dir) { grunt.config('dist', dir); }
   });

   grunt.registerTask('build', 'Create bootstrap build files', function() {
      var _ = grunt.util._;

      //If arguments define what modules to build, build those. Else, everything
      if (this.args.length) {
         this.args.forEach(findModule);
         grunt.config('filename', grunt.config('filenamecustom'));
      } else {


         browse('directives');
         browse('services');
      }

      var modules = grunt.config('modules');
      grunt.config('srcModules', _.pluck(modules, 'moduleName'));
      grunt.config('tplModules', _.pluck(modules, 'tplModules').filter(function(tpls) { return tpls.length > 0;} ));

      var srcFiles = _.pluck(modules, 'srcFiles');
      var tpljsFiles = _.pluck(modules, 'tpljsFiles');

      //Set the concat task to concatenate the given src modules
      grunt.config('concat.dist.src', grunt.config('concat.dist.src')
         .concat(srcFiles));
      //Set the concat-with-templates task to concat the given src & tpl modules
      grunt.config('concat.dist_tpls.src', grunt.config('concat.dist_tpls.src')
         .concat(srcFiles).concat(tpljsFiles));

      grunt.task.run(['concat', 'uglify']);
   });

   grunt.registerTask('test', 'Run tests on singleRun karma server', function() {
      //this task can be executed in 3 different environments: local, Travis-CI and Jenkins-CI
      //we need to take settings for each one into account
      if (process.env.TRAVIS) {
         grunt.task.run('karma:travis');
      } else {
         grunt.task.run(this.args.length ? 'karma:jenkins' : 'karma:continuous');
      }
   });

   function setVersion(type, suffix) {
      var file = 'package.json';
      var VERSION_REGEX = /([\'|\"]version[\'|\"][ ]*:[ ]*[\'|\"])([\d|.]*)(-\w+)*([\'|\"])/;
      var contents = grunt.file.read(file);
      var version;
      contents = contents.replace(VERSION_REGEX, function(match, left, center) {
         version = center;
         if (type) {
            version = require('semver').inc(version, type);
         }
         //semver.inc strips our suffix if it existed
         if (suffix) {
            version += '-' + suffix;
         }
         return left + version + '"';
      });
      grunt.log.ok('Version set to ' + version.cyan);
      grunt.file.write(file, contents);
      return version;
   }

   grunt.registerTask('version', 'Set version. If no arguments, it just takes off suffix', function() {
      setVersion(this.args[0], this.args[1]);
   });

   grunt.registerMultiTask('shell', 'run shell commands', function() {
      var self = this;
      var sh = require('shelljs');
      self.data.forEach(function(cmd) {
         cmd = cmd.replace('%version%', grunt.file.readJSON('package.json').version);
         grunt.log.ok(cmd);
         var result = sh.exec(cmd,{silent:true});
         if (result.code !== 0) {
            grunt.fatal(result.output);
         }
      });
   });

   return grunt;
};