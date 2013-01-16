port = process.env.PORT or 3000

modules = 
    http: require 'http'
    url: require 'url'
    fs: require 'fs'
    child_process: require 'child_process'
    util: require 'util'
    express: express = require 'express'
    path: path = require 'path'

app = express()

coffee = (next)->
    modules.child_process.exec "#{__dirname}/../node_modules/coffee-script/bin/coffee -o #{__dirname}/public/js/ -cb #{__dirname}/assets/coffee/", (err,stdout,stderr)->
        if stderr
            modules.child_process.exec "#{__dirname}/../node_modules/coffee-script/bin/coffee -p -c #{__dirname}/assets/coffee/", (err,stdout,stderr)->
                console.log 'coffee err: ',stderr
            next() if next
        else
            next()
            #modules.fs.writeFile "#{__dirname}/public/js/main.js", stdout, ->
                #next() if next

less = (next)->
    modules.child_process.exec "#{__dirname}/../node_modules/less/bin/lessc #{__dirname}/assets/less/main.less", (err,stdout,stderr)->
        if err
            console.log err
            if stderr
                console.log stderr
            next() if next
        else if stderr
            console.log stderr
            next() if next
        else if stdout
            modules.fs.writeFile __dirname+'/public/css/main.css', stdout, ->
                next() if next

app.configure ->
    app.use express.favicon()
    app.use express.cookieParser()
    app.use express.bodyParser()
    app.use express.methodOverride()
    app.use app.router
    app.use express.static(path.join(__dirname, 'public'))

app.configure "development", ->
    app.use express.errorHandler
        dumpExceptions: true
        showStack: true

app.configure "production", ->
    app.use express.errorHandler
        dumpExceptions: false
        showStack: false

app.get '/', (req,res)->
    less ->
        coffee ->
            html = modules.fs.readFileSync __dirname+'/public/index.html'
            res.setHeader 'Content-Type', 'text/html'
            res.setHeader 'Content-Length', html.length
            res.end html

app.get '/test', (req,res)->
    less ->
        coffee ->
            html = modules.fs.readFileSync __dirname+'/public/test.html'
            res.setHeader 'Content-Type', 'text/html'
            res.setHeader 'Content-Length', html.length
            res.end html

modules.http.createServer(app).listen port, ->
    console.log  'server start on port '+port
