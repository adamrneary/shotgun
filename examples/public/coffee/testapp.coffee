class window.Testapp
    constructor: (options)->
        console.log 'testapp initialize'
        $.ajax
            url: "http://nominatim.openstreetmap.org/search?city=Moscow&format=json&polygon=1&"+Math.random()
            success: =>
                console.log 'testapp init, 1 data loaded'
                options.callback() if options.callback

    fun1: (cb)->
        $.ajax
            url: "http://nominatim.openstreetmap.org/search?city=Paris&format=json&polygon=1&"+Math.random()
            success: =>
                console.log 'testapp fun1'
                cb() if cb
    fun2: (cb)->
        $.ajax
            url: "http://nominatim.openstreetmap.org/search?query=Sidney&format=json&polygon=1&"+Math.random()
            success: =>
                console.log 'testapp fun2'
                cb() if cb
    ready: ->
        console.log 'all ready'
