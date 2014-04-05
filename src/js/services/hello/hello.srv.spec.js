describe('service: Hello', function() {

    beforeEach(module('angular.library'));
    beforeEach(inject(function($injector) {
    }));

    it('should say hello world', inject(function(HelloService) {
        expect(HelloService.sayHello()).toBe('hello world!');
    }));

});