class window.Testapp
  constructor: (options)->
    setTimeout =>
      options.callback() if options.callback
    , 1000

  fun1: (cb)->
    setTimeout =>
      cb() if cb
    , 1000
  fun2: (cb)->
    setTimeout =>
      cb() if cb
    , 1000
  ready: ->
