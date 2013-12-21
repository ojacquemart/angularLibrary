angular.module("angular.library", ["angular.library.directives.bar","angular.library.directives.foo"]);
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