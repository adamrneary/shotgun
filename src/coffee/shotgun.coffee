window.Shotgun = Shotgun = {}

Shotgun.Loader = class Loader

  scriptMax: 0.2
  scriptLength: 106
  #scriptLength: 212

  styleMax: 0.2
  styleLength: 50

  #dataMax: 0.5
  #dataLength: 1000000

  funMax: 0.6

  debug: false
  width: 300
  height: 300
  twoPi: 2 * Math.PI
  progress: 0

  constructor: (options)->
    @options = options or {}
    @options.el = 'body' unless @options.el
    @debug = @options.debug

  log: (from,msg)->
    if from and msg
      console.log "Shotgun.Loader #{from}: #{msg}" if @debug
    else if from
      console.log from if @debug

  start: ->
    @formatPercent = d3.format(".0%")
    @log 'start', 'options:'
    @log @options
    #@load 'script', @dependencies, 20, 'Loading dependencies...', =>
    @render()
    @loadScript =>
      @loadStyle =>
        #@loadData =>
        @applyFunctions =>
          @log "start", "all ready, starting app"
          clearInterval @interval
          @options.ready @script,@data
          setTimeout =>
            @meter.transition().delay(250).attr "transform", "scale(0)"
            @el.remove()
          , 10

  render: ->
    @el = d3.select('body').append('div').attr('id','shotgun')
    @arc = d3.svg.arc().startAngle(0).innerRadius(50).outerRadius(60)
    @svg = @el.append("svg").attr("width", @width).attr("height", @height)
    g = @svg.append("g").attr("transform", "translate(" + @width / 2 + "," + @height / 2 + ")")
    @meter = g.append("g").attr("class", "progress-meter")
    @meter.append("path").attr("class", "background").attr "d", @arc.endAngle(@twoPi)
    @foreground = @meter.append("path").attr("class", "foreground")
    @text = @meter.append("text").attr("text-anchor", "middle").attr("dy", "100px")

    @interval = setInterval =>
      if @progress < 0.99
        #t = 0.001
        #i = d3.interpolate(@progress, @progress+t)
        @progress += 0.001
        @foreground.attr "d", @arc.endAngle(@twoPi * @progress)
        # @text.text @formatPercent(@progress)
    , 10

  updateProgress: (progress)->

  loadScript: (cb)->
    @log "loadScript", "loading #{@options.url.js}"
    loaded = false
    xhr = d3.xhr("#{@options.url.js}")
    xhr.on "progress", =>
      @transition @progress+((d3.event.loaded/@scriptLength)*@scriptMax)
    xhr.get (error, data)=>
      @script = data.response.toString()
      @transition @scriptMax
      cb()

  loadStyle: (cb)->
    @log "loadStyle", "loading #{@options.url.css}"
    xhr = d3.xhr("#{@options.url.css}")
    xhr.on "progress", =>
      @transition @progress+((d3.event.loaded/@styleLength)*@styleMax)
    xhr.get (error, data)=>
      d3.select('head').append('style').html data.response
      @transition @scriptMax+@styleMax
      cb()

  loadData: (cb)->
    @log "loadData", "loading data"
    xhr = d3.xhr("#{@options.url.data}")
    xhr.on "progress", =>
      @transition @progress+((d3.event.loaded/@dataLength)*@dataMax)
    xhr.get (error, data)=>
      if data
        @data = data.response.toString()
      @transition @dataMax
      cb()

  callRecursive: (i,cb)->
    if @options.functions[i]
      @options.functions[i] =>
        cur = @scriptMax+@styleMax+(i+1)*@dataMax/@options.functions.length
        if cur > @progress
          @transition cur
        i++
        if @options.functions[i]
          @callRecursive i,cb
        else
          cb()
    else
      cb()

  applyFunctions: (cb)->
    @log "loadData", "loading data"
    #@interval = setInterval =>
      #if @progress < 0.99
        ##t = 0.001
        ##i = d3.interpolate(@progress, @progress+t)
        #@progress += 0.001
        #@foreground.attr "d", @arc.endAngle(@twoPi * @progress)
        #@text.text @formatPercent(@progress)
      ##@transition @progress+0.001,1
    #, 20
    @callRecursive 0,cb

  transition: (cur)->
    console.log 'transition',cur if @debug
    cur = 99 if cur > 99
    d3.transition().tween "progress", =>
      (t) =>
        if @progress < 0.99
          i = d3.interpolate(@progress, cur)
          @progress = i(t)
          @foreground.attr "d", @arc.endAngle(@twoPi * @progress)
          @text.text @formatPercent(@progress)
