angular.module('angular.library')
// Use WeatherService to test ngmin.
.service('HelloService', function(WeatherService) {
  this.sayHello = function() {
    return 'hello world!';
  };
  this.getTemp = function() {
      return WeatherService.getTemp();
  };
})
;