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

compile = (next)->

    #compile examples coffee
    modules.child_process.exec "#{__dirname}/node_modules/coffee-script/bin/coffee -j #{__dirname}/examples/js/examples.js -cb #{__dirname}/src/examples/coffee/", (err,stdout,stderr)->
        if stderr
            modules.child_process.exec "#{__dirname}/node_modules/coffee-script/bin/coffee -p -cb #{__dirname}/src/examples/coffee/", (err,stdout,stderr)->
                console.log 'coffee err: ',stderr
        else
            console.log 'examples compiled'
        #compile examples css
        modules.child_process.exec "#{__dirname}/node_modules/less/bin/lessc #{__dirname}/src/examples/less/index.less", (err,stdout,stderr)->
            console.log 'less err: ',stderr if stderr
            modules.fs.writeFile __dirname+'/examples/css/examples.css', stdout, ->

                #compile testapp coffee
                modules.child_process.exec "#{__dirname}/node_modules/coffee-script/bin/coffee -j #{__dirname}/examples/js/testapp.js -cb #{__dirname}/src/testapp/coffee/", (err,stdout,stderr)->
                    if stderr
                        modules.child_process.exec "#{__dirname}/node_modules/coffee-script/bin/coffee -p -cb #{__dirname}/src/testapp/coffee/", (err,stdout,stderr)->
                            console.log 'coffee err: ',stderr
                    else
                        console.log 'testapp compiled'
                    #compile testapp css
                    modules.child_process.exec "#{__dirname}/node_modules/less/bin/lessc #{__dirname}/src/testapp/less/index.less", (err,stdout,stderr)->
                        console.log 'less err: ',stderr if stderr
                        modules.fs.writeFile __dirname+'/examples/css/testapp.css', stdout, ->

                            #compile dist coffee
                            modules.child_process.exec "#{__dirname}/node_modules/coffee-script/bin/coffee -j #{__dirname}/dist/js/shotgun.js -cb #{__dirname}/src/dist/coffee/", (err,stdout,stderr)->
                                if stderr
                                    modules.child_process.exec "#{__dirname}/node_modules/coffee-script/bin/coffee -p -cb #{__dirname}/src/dist/coffee/", (err,stdout,stderr)->
                                        console.log 'coffee err: ',stderr
                                else
                                    console.log 'dist compiled'
                                #compile dist css
                                modules.child_process.exec "#{__dirname}/node_modules/less/bin/lessc #{__dirname}/src/dist/less/index.less", (err,stdout,stderr)->
                                    console.log 'less err: ',stderr if stderr
                                    modules.fs.writeFile __dirname+'/dist/css/shotgun.css', stdout, ->
                                        next()

#modules.fs.writeFile "#{__dirname}/public/js/main.js", stdout, ->
    #next() if next

app.configure ->
    app.use express.favicon()
    app.use express.cookieParser()
    app.use express.bodyParser()
    app.use express.methodOverride()
    app.use app.router
    app.use express.static(path.join(__dirname, 'examples'))
    app.use express.errorHandler
        dumpExceptions: true
        showStack: true

app.get '/', (req,res)->
    compile ->
        html = modules.fs.readFileSync __dirname+'/examples/index.html'
        res.setHeader 'Content-Type', 'text/html'
        res.setHeader 'Content-Length', html.length
        res.end html

app.get '/test', (req,res)->
    compile ->
        html = modules.fs.readFileSync __dirname+'/examples/test.html'
        res.setHeader 'Content-Type', 'text/html'
        res.setHeader 'Content-Length', html.length
        res.end html

modules.http.createServer(app).listen port, ->
    console.log  'server start on port '+port
