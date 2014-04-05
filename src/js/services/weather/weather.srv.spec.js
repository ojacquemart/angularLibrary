describe('service: WeatherService', function () {

    beforeEach(module('angular.library'));

    beforeEach(inject(function () {
    }));

    it('should get a temp of 100', inject(function (WeatherService) {
        expect(WeatherService.getTemp()).toBe(100);
    }));

    it('should get current weather', inject(function (WeatherService) {
        expect(WeatherService.getCurrentWeather()).toBe('so hot!');
    }));

});