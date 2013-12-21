angular.module('angular.library.services.weather', [])
   .service('WeatherService', function() {
      return {
         'weather': function() {
            return 'so hot!';
         }
      };
   })
;