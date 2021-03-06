/**
 * Angular Library
 * @version v1.0.45
 * @link 
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
angular.module("angular.library", ["angular.library.tpls", "angular.library.directives.bar","angular.library.directives.foo","angular.library.services.foo","angular.library.services.hello","angular.library.services.weather"]);
angular.module("angular.library.tpls", ["src/js/directives/bar/bar.tpl.html","src/js/directives/foo/foo.tpl.html"]);
angular.module("src/js/directives/bar/bar.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/js/directives/bar/bar.tpl.html",
    "bar");
}]);

angular.module('angular.library.directives.bar', [ ])
   .directive('bar', function() {
      return {
         restrict: 'EA',
         templateUrl: 'src/js/directives/bar/bar.tpl.html'
      };
   })
;
angular.module("src/js/directives/foo/foo.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/js/directives/foo/foo.tpl.html",
    "foo\n" +
    "");
}]);

angular.module('angular.library.directives.foo', [])
   .directive('foo', function() {
      return {
         restrict: 'EA',
         templateUrl: 'src/js/directives/foo/foo.tpl.html'
      };
   })
;
angular.module('angular.library.servics.foo', [])
   .service('FooService', function() {
      return {
         foo: function() {
            return 'foo orly';
         }
      };
   })
;
angular.module('angular.library.services.hello', [])
   .service('HelloService', function() {
      return {
         hello: function() {
            return 'hello world!';
         }
      };
   })
;
angular.module('angular.library.services.weather', [])
   .service('WeatherService', function() {
      return {
         weather: function() {
            return 'so hot!';
         }
      };
   })
;