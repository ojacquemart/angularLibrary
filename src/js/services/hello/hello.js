angular.module('angular.library.services.hello', [])
   .service('HelloService', function() {
      return {
         hello: function() {
            return 'hello world!';
         }
      };
   })
;