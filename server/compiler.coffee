fs = require 'fs'
child_process = require 'child_process'
sass = require 'node-sass'

coffeePath = "#{__dirname}/../node_modules/coffee-script/bin/coffee"

module.exports.compile = (cb, skipAssets) ->
  compileCoffeeSrc ->
    joinAssets skipAssets, "#{__dirname}/../dist/#{glob.config.name}.js", ['d3'], ->
      compileCoffeeTests ->
      compileCoffeeExamples ->
        switch glob.config.css
          when 'less'
            compileLess ->
              cb() if cb
          when 'scss'
            compileScss ->
              cb() if cb

joinAssets = (skip,dest,assets,cb)->
  if skip
    cb()
  else
    result = ''
    for asset in assets
      result += fs.readFileSync "#{__dirname}/../examples/public/libs/#{asset}.js"
    result += fs.readFileSync dest
    fs.writeFile dest, result, (err)->
      cb() if cb

compileCoffeeTests = (cb) ->
  testDest = "#{__dirname}/../examples/public/js/test.js"
  srcDir = "#{__dirname}/../test/unit/*_test.coffee"
  command1 = "#{coffeePath} -j #{testDest} -cb #{srcDir}"
  command2 = "#{coffeePath} -p -cb #{srcDir}"

  child_process.exec command1, (err,stdout,stderr) ->
    if stderr
      child_process.exec command2, (err,stdout,stderr) ->
        console.log 'coffee err: ',stderr
        cb()
    else
      cb()

compileCoffeeSrc = (cb) ->
  srcDest = "#{__dirname}/../dist/#{glob.config.name}.js"
  srcDir = "#{__dirname}/../src/coffee/"
  command1 = "#{coffeePath} -j #{srcDest} -cb #{srcDir}"
  command2 = "#{coffeePath} -p -cb #{srcDir}"
  doccoPath = "#{__dirname}/../node_modules/docco/bin/docco"
  docsDir = "#{__dirname}/../examples/public/docs/"

  child_process.exec command1, (err,stdout,stderr) ->
    if stderr
      child_process.exec command2, (err,stdout,stderr) ->
        console.log 'coffee err: ',stderr
        cb()
    else
      child_process.exec "#{doccoPath} #{srcDir}*.coffee -o #{docsDir}"
      cb()

compileCoffeeExamples = (cb) ->
  destDir = "#{__dirname}/../examples/public/js/"
  srcDir = "#{__dirname}/../examples/public/coffee/"
  command1 = "#{coffeePath} -o #{destDir} -cb #{srcDir}"
  command2 = "#{coffeePath} -p -cb #{srcDir}"

  child_process.exec command1, (err,stdout,stderr) ->
    if stderr
      child_process.exec command2, (err,stdout,stderr) ->
        console.log 'coffee err: ',stderr
        cb()
    else
      cb()

compileScss = (cb) ->
  fs.readFile "#{__dirname}/../src/scss/#{glob.config.name}.scss", (err, scssFile) ->
    sass.render scssFile.toString(), (err, css) ->
      if err
        console.log err
        cb()
      else
        fs.writeFile "#{__dirname}/../dist/#{glob.config.name}.css", css, ->
          cb()
    , { include_paths: [ "#{__dirname}/../src/scss/"] }

compileLess = (cb) ->
  lesscPath = "#{__dirname}/../node_modules/less/bin/lessc"
  lessDest = "#{__dirname}/../src/less/index.less"
  child_process.exec "#{lesscPath} #{lessDest}", (err,stdout,stderr) ->
    console.log 'less err: ',stderr if stderr
    fs.writeFile "#{__dirname}/../dist/#{name}.css", stdout, ->
      cb()
