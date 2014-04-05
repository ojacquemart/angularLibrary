angular.module('demo.app', [ 'angular.library' ])
.controller('DemoCtrl', function($scope, HelloService) {
    $scope.hello = HelloService.sayHello();
})
;