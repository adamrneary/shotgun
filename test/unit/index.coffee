describe 'unit tests', ->
  before (done)->
    glob.zombie.visit glob.url+'#asd', (e, _browser) ->
      browser = _browser
      window = browser.window
      global.browser = browser
      global.window = window
      global.d3 = browser.window.d3
      #if glob.report
      require __dirname+'/../cov/shotgun.js'
      done()

  require './shotgun_test'
