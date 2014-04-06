angular.module('demoE2EMocks', [ 'ngMockE2E' ])
.run(function ($interpolate, $log, $httpBackend) {
    // Don't mock js/* directives partials.
    $httpBackend.whenGET(/js\/.*/).passThrough();

    $httpBackend.whenGET('/phones').respond(function (method, url, data, headers) {
        var tplMessage = $interpolate('$http: [url={{url}}, method={{method}}, headers={{headers}}, data={{data}}]');
        $log.debug(tplMessage({ url: url, method: method, data: data, headers: headers }));

        return [
            200,
            [
                { name: 'Nexus 5' },
                { name: 'Nexus 4' },
                { name: 'LG G2' },
                { name: 'Samsung Galaxy S5' }
            ], {}
        ]
    });
});

// Add mocks to demo app.
angular.module('demo.app').requires.push('demoE2EMocks');