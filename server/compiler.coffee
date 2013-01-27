fs = require 'fs'
child_process = require 'child_process'
sass = require 'node-sass'

module.exports.css = 'scss'
module.exports.name = 'dist'
module.exports.options =
    examples:
        coffee:
            join: true

module.exports.compile = (cb)->
    compileCoffeeSrc ->
        compileCoffeeTests ->
            compileCoffeeExamples ->
                compileExamplesScss ->
                    switch module.exports.css
                        when 'less'
                            compileLess ->
                                cb()
                        when 'scss'
                            compileScss ->
                                cb()

compileCoffeeTests = (cb)->
    child_process.exec "#{__dirname}/../node_modules/coffee-script/bin/coffee -j #{__dirname}/../examples/public/js/test.js -cb #{__dirname}/../test/client/", (err,stdout,stderr)->
        if stderr
            child_process.exec "#{__dirname}/../node_modules/coffee-script/bin/coffee -p -cb #{__dirname}/../test/client/", (err,stdout,stderr)->
                console.log 'coffee err: ',stderr
                cb()
        else
            cb()

compileCoffeeSrc = (cb)->
    child_process.exec "#{__dirname}/../node_modules/coffee-script/bin/coffee -j #{__dirname}/../dist/#{module.exports.name}.js -cb #{__dirname}/../src/coffee/", (err,stdout,stderr)->
        if stderr
            child_process.exec "#{__dirname}/../node_modules/coffee-script/bin/coffee -p -cb #{__dirname}/../src/coffee/", (err,stdout,stderr)->
                console.log 'coffee err: ',stderr
                cb()
        else
            cb()

compileCoffeeExamples = (cb)->
    if module.exports.options.examples.coffee.join
        child_process.exec "#{__dirname}/../node_modules/coffee-script/bin/coffee -j #{__dirname}/../examples/public/js/examples.js -cb #{__dirname}/../examples/src/coffee/", (err,stdout,stderr)->
            if stderr
                child_process.exec "#{__dirname}/../node_modules/coffee-script/bin/coffee -p -cb #{__dirname}/../examples/src/coffee/", (err,stdout,stderr)->
                    console.log 'coffee err: ',stderr
                    cb()
            else
                cb()
    else
        child_process.exec "#{__dirname}/../node_modules/coffee-script/bin/coffee -o #{__dirname}/../examples/public/js/ -cb #{__dirname}/../examples/src/coffee/", (err,stdout,stderr)->
            if stderr
                child_process.exec "#{__dirname}/../node_modules/coffee-script/bin/coffee -p -cb #{__dirname}/../examples/src/coffee/", (err,stdout,stderr)->
                    console.log 'coffee err: ',stderr
                    cb()
            else
                cb()

compileScss = (cb)->
    fs.readFile "#{__dirname}/../src/scss/#{module.exports.name}.scss", (err, scssFile)->
        sass.render scssFile.toString(), (err, css)->
            if err
                console.log err
                cb()
            else
                fs.writeFile "#{__dirname}/../dist/#{module.exports.name}.css", css, ->
                    cb()
        , { include_paths: [ "#{__dirname}/../src/scss/"] }

compileExamplesScss = (cb)->
    fs.readFile "#{__dirname}/../examples/src/scss/examples.scss", (err, scssFile)->
        sass.render scssFile.toString(), (err, css)->
            if err
                console.log err
                cb()
            else
                fs.writeFile "#{__dirname}/../examples/public/css/examples.css", css, ->
                    cb()
        , { include_paths: [ "#{__dirname}/../examples/src/scss/"] }

#compileLess = (cb)->
    #child_process.exec "#{__dirname}/../node_modules/less/bin/lessc #{__dirname}/../src/less/index.less", (err,stdout,stderr)->
        #console.log 'less err: ',stderr if stderr
        #fs.writeFile "#{__dirname}/../dist/#{name}.css", stdout, ->
            #cb()
