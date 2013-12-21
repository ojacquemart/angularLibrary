angular.module('angular.library.directives.bar', [ ])
   .directive('bar', function() {
      return {
         restrict: 'EA',
         templateUrl: 'src/js/directives/bar/bar.tpl.html'
      };
   })
;