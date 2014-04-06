angular.module('angular.library')
.directive('bar', function() {
  return {
     restrict: 'EA',
     templateUrl: 'js/directives/bar/bar.html'
  };
})
;