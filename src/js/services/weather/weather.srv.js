angular.module('angular.library')
.service('WeatherService', function() {
  this.getTemp = function() {
    return 100;
  };
  this.getCurrentWeather = function() {
    return 'so hot!';
  };
})
;