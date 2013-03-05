loader = new Shotgun.Loader
  debug: true
  url:
    js: 'js/testapp.js?'+Math.random()
    css: 'css/testapp.css?'+Math.random()
  functions: [
    (cb)->
      setTimeout ->
        cb()
      , 2000
  ]
  ready: ->

$(document).ready ->
  loader.start()
