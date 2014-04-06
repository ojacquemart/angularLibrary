angular.module('demo.app', [ 'angular.library' ])
.controller('DemoCtrl', function ($scope, $http, HelloService) {
    $scope.hello = HelloService.sayHello();

    $http.get('/phones').success(function(data) {
        $scope.phones = data;
    });
});