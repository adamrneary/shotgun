loader = new Shotgun.Loader
    urls:
        libs: [
            'http://underscorejs.org/underscore-min.js'
            'http://backbonejs.org/backbone-min.js'
        ]
        apps: [
            '/js/testapp.js'
        ]
    debug: true
    data: (cb)->
        console.log 'some data'
        cb()
    ready: (data)->
        Testapp(data)

$(document).ready ->
    loader.start()
