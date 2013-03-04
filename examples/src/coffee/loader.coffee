loader = new Shotgun.Loader
  debug: true
  el: '#loader'
  url:
    js: 'js/testapp.js?'+Math.random()
    css: 'css/testapp.css?'+Math.random()
    #data: '/mocha'
  functions: [
    (cb)->
      setTimeout ->
        console.log 'fn ready'
        cb()
      , 1000
      #window.app = new window.Testapp
        #callback: cb
  #,   (cb)->
      #window.app.fun1 cb
  #,   (cb)->
      #window.app.fun2 cb
  ]
  ready: ->
    console.log 'ready'
    #window.app.ready()

$(document).ready ->
  loader.start()
