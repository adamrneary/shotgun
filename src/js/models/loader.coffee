Shotgun.Loader = class Loader
# # Add your renderer here. Key should be equal to the renderer `name` property
#   _renderers:
#     'gauge': GaugeRenderer
#     'column': ColumnRenderer
#     'line': LineRenderer
#     'area': AreaRenderer
#     'scatter': ScatterRenderer
#     'donut': DonutRenderer
# 
#   mainDefaults:
#     margin: {top: 20, right: 20, bottom: 20, left: 20}
#     padding: {top: 10, right: 10, bottom: 10, left: 10}
#     interpolation: 'monotone'
#     offset: 'zero'
#     min: undefined
#     max: undefined
#     transitionSpeed: 200
#     order: [] # multi renderer support
#     height: 400
#     width: 730
#     axes:
#       x:
#         dimension: "time"
#         frame: [undefined, undefined]
#       y:
#         dimension: "linear"
#         frame: [undefined, undefined]
# 
# 
#   seriesDefaults:
#     dataTransform: (d) -> d
# 
#   constructor: (args) ->
#     @renderers = []
#     @window = {}
#     @updateCallbacks = []
# 
#     args = _.extend({}, @mainDefaults, args)
#     args.series = (if args.series then _.map(args.series, (d) => _.extend({}, @seriesDefaults, d)) else [])
#     #TODO: Deep copy issuses abound here. 
#     args.axes =
#         x:
#           frame: (args.axes?.x?.frame or @mainDefaults.axes.x.frame)
#           dimension: (args.axes?.x?.dimension or @mainDefaults.axes.x.dimension)
#         y:
#           frame: (args.axes?.y?.frame or @mainDefaults.axes.y.frame)
#           dimension: (args.axes?.y?.dimension or @mainDefaults.axes.y.dimension)
# 
# 
#     _.each args, (val, key) =>
#       @[key] = val
# 
#     @series.active = =>
#       @series.filter (s) ->
#         not s.disabled
# 
#     @setSize( width: args.width, height: args.height )
#     # need a constant class name for a containing div
#     $(@element).addClass('graph-container')
#     @_setupCanvas()
# 
#     @initRenderers(args)
#     
#     # TODO:
#     # it should be possible to pass options to the axes
#     # so far they were 
#     # for x: unit, ticksTreatment, grid 
#     # for y: orientation, pixelsPerTick, ticks and few more.
#     axes = [@findAxis(@axes.x), @findAxis(@axes.y)]
# 
# 
#   render: ->
#     return if @renderers is undefined or _.isEmpty(@renderers)
#     stackedData = @stackData()
# 
#     _.each @renderers, (renderer) =>
#       # discover domain for current renderer
#       @discoverRange(renderer)
#       renderer.render()
# 
#     @updateCallbacks.forEach (callback) ->
#       callback()
# 
#   update: ->
#     @render()
# 
#   discoverRange: (renderer) =>
#     domain = renderer.domain()
#     if renderer.cartesian
#       # TODO: This needs way prettier implementation
#       # It moves the range 'right' by the value of half width of a bar
#       # So if we have renderers including bar chart points are 
#       # rendered in the center of each bar and not a single bar is cut off by the chart border
#       if @_containsColumnChart()
#         barWidth = @width / renderer.series.stack.length / 2
#         rangeStart = barWidth
#         rangeEnd = @width - barWidth
# 
#       xframe = [(if @axes.x.frame[0] then @axes.x.frame[0] else domain.x[0]),
#                 (if @axes.x.frame[1] then @axes.x.frame[1] else domain.x[1])]
#       yframe = [(if @axes.y.frame[0] then @axes.y.frame[0] else domain.y[0]),
#                 (if @axes.y.frame[1] then @axes.y.frame[1] else domain.y[1])]
# 
# 
#       @x = d3.scale.linear().domain(xframe).range([rangeStart || 0, rangeEnd || @width])
#       @y = d3.scale.linear().domain(yframe).range([@height, 0])
#       @y.magnitude = d3.scale.linear()
#         .domain([domain.y[0] - domain.y[0], domain.y[1] - domain.y[0]])
#         .range([0, @height])
# 
#   findAxis: (axis) ->
#     return unless @_allRenderersCartesian()
#     switch axis.dimension
#       when "linear"
#         new Tactile.AxisY(_.extend {}, axis.options, {graph: @})
#       when "time"
#         new Tactile.AxisTime(_.extend {}, axis.options, {graph: @})
#       else
#         console.log("ERROR:#{axis.dimension} is not currently implemented")
# 
#   # Used by range slider
#   dataDomain: ->
#     # take from the first series
#     data = @renderers[0].series.stack
#     [data[0].x, data.slice(-1).shift().x]
# 
#   stackData: ->
#     # Read more about stacking data here: 
#     # https://github.com/mbostock/d3/wiki/Stack-Layout
# 
#     seriesData = @series.active().map((d) =>
#       @data.map(d.dataTransform))
# 
#     layout = d3.layout.stack()
#     layout.offset(@offset)
#     stackedData = layout(seriesData)
# 
#     i = 0
#     @series.forEach (series) ->
#       series.stack = stackedData[i++]
# 
#     @stackedData = stackedData
# 
#   setSize: (args) ->
#     args = args || {}
# 
#     elWidth = $(@element).width()
#     elHeight = $(@element).height()
# 
#     @outerWidth = args.width || elWidth
#     @outerHeight = args.height || elHeight
# 
#     @innerWidth = @outerWidth - @margin.left - @margin.right
#     @innerHeight = @outerHeight - @margin.top - @margin.bottom
#     @width = @innerWidth - @padding.left - @padding.right
#     @height = @innerHeight - @padding.top - @padding.bottom
# 
#     @vis?.attr('width', @width).attr('height', @height)
# 
#   onUpdate: (callback) ->
#     @updateCallbacks.push callback
# 
#   initRenderers: (args) ->
#     _.each @series.active(), (s, index) =>
#       name = s.renderer
#       if (!@_renderers[name])
#         throw "couldn't find renderer #{name}"
# 
#       rendererClass = @_renderers[name]
#       rendererOptions = _.extend {}, args, {graph: @, series: s, rendererIndex: index}
#       r = new rendererClass(rendererOptions)
#       @renderers.push r
# 
# 
#   # appends all the chart canvas elements so it respects the margins and paddings
#   # done by following this example: http://bl.ocks.org/3019563
#   _setupCanvas: ->
#     @svg = d3.select(@element)
#       .append("svg")
#         .attr('width', @outerWidth)
#         .attr('height', @outerHeight)
# 
#     @vis = @svg.append("g")
#         .attr("transform", "translate(#{@margin.left},#{@margin.top})")
# 
#     @vis = @vis.append("g")
#       .attr("class", "outer-canvas")
#       .attr("width", @innerWidth)
#       .attr("height", @innerHeight)
# 
#     # this is the canvas on which all data should be drawn  
#     @vis = @vis.append("g")
#       .attr("transform", "translate(#{@padding.left},#{@padding.top})")
#       .attr("class", "inner-canvas")
# 
#     # Add the default clip path.
#     @vis.append("clipPath")
#         .attr("id", "clip")
#       .append("rect")
#         .attr("width", @width)
#         # increase height to provide room vertically for line thickness
#         .attr("height", @height + 4)
#         # translate to adjust for increased height (split the difference)
#         .attr("transform", "translate(0,-2)")
# 
#     # Add the clip path.
#     @vis.append("clipPath")
#         .attr("id", "scatter-clip")
#       .append("rect")
#         # increase width to provide room vertically for circle radius
#         .attr("width", @width + 12)
#         # increase height to provide room vertically for circle radius
#         .attr("height", @height + 12)
#         # translate to adjust for increased width and height
#         .attr("transform", "translate(-6,-6)")
# 
# 
# 
#   # this trims data down to the range that is currently viewed. 
#   # See range_slider for a clue how it's used
#   _slice: (d) =>
#     return true unless @_allRenderersCartesian()
#     @timeframe[0] <= d.x <= @timeframe[1]
# 
#   _deg2rad: (deg) ->
#     deg * Math.PI / 180
# 
#   _hasDifferentRenderers: ->
#     _.uniq(_.map(@series, (s) -> s.renderer)).length > 1
# 
#   _containsColumnChart: ->
#     _.any(@renderers, (r) -> r.name == 'column')
# 
#   _allRenderersCartesian: ->
#     _.every(@renderers, (r) -> r.cartesian is true)
# 
#   renderersByType: (name) ->
#     @renderers.filter((r) -> r.name == name)
# 
#   stackTransition: ->
#     # Probably we'll want other types soon too
#     _.each(@renderersByType('column'), (r) -> r.stackTransition())
# 
#   unstackTransition: ->
#     _.each(@renderersByType('column'), (r) -> r.unstackTransition())
#     
#     
