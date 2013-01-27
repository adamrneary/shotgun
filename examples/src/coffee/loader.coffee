loader = new Shotgun.Loader
    el: '#loader'
    url:
        js: 'js/testapp.js?'+Math.random()
        css: 'css/testapp.css?'+Math.random()
    functions: [
        (cb)->
            window.app = new window.Testapp
                callback: cb
    ,   (cb)->
            window.app.fun1 cb
    ,   (cb)->
            window.app.fun2 cb
    ]
    ready: ->
        window.app.ready()

$(document).ready ->
    loader.start()
