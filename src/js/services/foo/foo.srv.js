angular.module('angular.library')
.service('FooService', function() {
    this.foo = function() {
        return 'foo orly';
    };
})
;