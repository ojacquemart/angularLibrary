angular.module('angular.library')
   .directive('foo', function() {
      return {
         restrict: 'EA',
         templateUrl: 'js/directives/foo/foo.html'
      };
   })
;