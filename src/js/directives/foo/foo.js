angular.module('angular.library.directives.foo', [])
   .directive('foo', function() {
      return {
         restrict: 'EA',
         templateUrl: 'src/js/directives/foo/foo.tpl.html'
      };
   })
;