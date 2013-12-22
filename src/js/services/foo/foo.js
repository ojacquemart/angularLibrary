angular.module('angular.library.servics.foo', [])
   .service('FooService', function() {
      return {
         foo: function() {
            return 'foo orly';
         }
      };
   })
;