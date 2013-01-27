name = 'shotgun'

port = process.env.PORT or 5000

modules = 
    http: require 'http'
    fs: require 'fs'
    express: express = require 'express'
    path: require 'path'
    kss: require 'kss'
    jade: require 'jade'
    #async: require 'async'

app = express()

app.configure ->
    app.set('port', port);
    app.set('views', __dirname + '/../examples/views');
    app.set('view engine', 'jade');
    app.use express.favicon()
    app.use express.cookieParser()
    app.use express.bodyParser()
    app.use express.methodOverride()
    app.use app.router
    app.use express.static "#{__dirname}/../examples/public/"
    app.use express.errorHandler
        dumpExceptions: true
        showStack: true

compiler = require('./compiler')
compiler.name = name
compiler.css = 'scss'
compiler.options.examples.coffee.join = false
compile = require('./compiler').compile

getSections = (sections,cb)->
    for section in sections
        section.data.filename = "#{name}.scss"
        section.data.description = section.data.description.replace(/\n/g, "<br />")
        jade = null
        try
            jade = modules.fs.readFileSync "#{__dirname}/../examples/views/sections/#{section.reference()}.jade"
        if jade
            locals =
                section: section
                className: '$modifier'
            html = modules.jade.compile(jade, {pretty: true})(locals)
            section.data.example = html
            for modifier in section.modifiers()
                modifier.data.example = modules.jade.compile(jade, {pretty: true})({className: modifier.className()})
    cb sections

app.get '/', (req,res)->
    compile ->
        res.render 'index'
            page: 'index'
            name: name

app.get '/mocha', (req,res)->
    compile ->
        res.render 'mocha'
            page: 'mocha'
            name: name

app.get '/styleguide', (req,res)->
    compile ->
        options = 
            markdown: false
        #modules.kss.traverse "#{__dirname}/../dist/#{name}.css", options, (err, styleguide)->
        #modules.kss.traverse "#{__dirname}/../dist/", options, (err, styleguide)->
        modules.kss.traverse "#{__dirname}/../src/", options, (err, styleguide)->
            getSections styleguide.section(), (sections)->
                res.render 'styleguide'
                    sections: sections
                    page: 'styleguide'
                    name: name

app.get "/js/#{name}.js", (req,res)->
    script = modules.fs.readFileSync "#{__dirname}/../dist/#{name}.js"
    res.setHeader 'Content-Type', 'text/javascript'
    res.setHeader 'Content-Length', script.length
    res.end script

app.get "/css/#{name}.css", (req,res)->
    style = modules.fs.readFileSync "#{__dirname}/../dist/#{name}.css"
    res.setHeader 'Content-Type', 'text/css'
    res.setHeader 'Content-Length', style.length
    res.end style

modules.http.createServer(app).listen port, ->
    console.log  'server start on port '+port
