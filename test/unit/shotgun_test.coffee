describe "shotgun", ->

  it 'constructor', (done) ->
    assert window.Shotgun
    assert window.Shotgun.Loader
    
    assert loader = new window.Shotgun.Loader
      debug: false
      url:
        js: 'js/testapp.js?'+Math.random()
        css: 'css/testapp.css?'+Math.random()
      functions: [
          (cb)->
            setTimeout ->
              cb()
            , 1000
      ]
      ready: ->
    assert loader.start()
    done()
