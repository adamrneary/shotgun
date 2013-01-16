Shotgun = {} unless Shotgun

Shotgun.Loader = class Loader

    template: \
        '''
            <div id="shotgun-loader-container">
                <div id="shotgun-loader-label">
                    Loading...
                </div>
                <div class="progress progress-striped active">
                    <div id="shotgun-loader-bar" class="bar" style="width: 0%;"></div>
                </div>
            </div>
        '''

    constructor: (options)->
        @options = options or {}
        @level = 0

    log: (from,msg)->
        if from and msg
            console.log "Shotgun.Loader #{from}: #{msg}" if @options.debug
        else if from
            console.log from if @options.debug

    start: ->
        @log 'start', 'options'
        @log @options
        #@load 'script', @dependencies, 20, 'Loading dependencies...', =>
        @render()
        @progress 20, 'Loading libraries...'
        @load 'script', @options.urls.libs, 20, 'Loading libraries...', =>
            @load 'script', @options.urls.apps, 20, 'Loading applications...', =>
                @progress 20, 'Loading data...'
                @options.data =>
                    @progress 20,'ready'
                    @options.ready()

    render: ->
        @el = $('<div id="shotgun-loader" />').appendTo('body')
        @el.html @template.toString()
        @label = $(@el).find('#shotgun-loader-label')
        @bar = $(@el).find('#shotgun-loader-bar')
        @rendered = true

    progress: (level, message)->
        console.log level
        @level += level
        return unless @rendered
        $(@bar).css
            width: @level+'%'
        $(@label).text(message) if message

    load: (type,urls,maxLevel,msg,done)->
        urls = [] unless urls?
        functions = []
        for url,i in urls
            functions.push (i)=>
                i = 0 unless i?
                @progress maxLevel/urls.length, urls[i]
                if type is 'data'
                    type = ''
                $.ajax
                    url: urls[i]
                    dataType: type
                    complete: =>
                        if functions[i+1]
                            functions[i+1](i+1)
                        else
                            done()
        if functions[0]
            functions[0]()
        else
            @progress maxLevel, 'done'
            done()
