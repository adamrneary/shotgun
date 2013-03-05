loader = new Shotgun.Loader
  debug: true
  el: '#loader'
  url:
    js: 'js/testapp.js?'+Math.random()
    css: 'css/testapp.css?'+Math.random()
    #data: '/mocha'
  functions: [(cb)->
      console.log 'fn1'
      setTimeout ->
        console.log 'fn ready'
        cb()
      , 1000
  ]
  ready: ->
    console.log 'ready'
    #window.app.ready()

$(document).ready ->
  loader.start()
