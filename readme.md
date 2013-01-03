# Shotgun 

A bad-ass backbone application loader.

## Requirements

Shotgun's git repo is available on GitHub, which can be browsed at:

    <http://github.com/activecell/shotgun>

and cloned with:

    git clone git://github.com/activecell/shotgun.git

Please use `script/bootstrap` to automatically check for current requirements (it should be run until it completes successfully).

## Building

To view the examples:
``` bash
grunt build
foreman start -f Procfile
```

Then navigate to the [showcase](http://localhost:5000). 

## Contributing

To contribute to Shotgun, please follow these instructions.

1. Clone the project with `git clone git://github.com/activecell/shotgun.git`
1. Run `script/bootstrap` to check for requirements
1. FUTURE: Run `rake` to ensure from the beginning that tests pass on your machine
1. Create a thoughtfully named topic branch to contain your change
1. Hack away
1. FUTURE: Add specs and make sure everything still passes by running 'rake'
1. If necessary, [rebase your commits into logical chunks](https://help.github.com/articles/interactive-rebase), without errors
1. Push the branch up to GitHub
1. Send a pull request for your branch

Note: You don't have to fork the project in order to create a branch and a pull request!

### Hacking on the source

Our grunt file automatically builds everything, so you only need to worry about the source itself. Inside the 'src' folder you will find:

* js/models/ for core chart models (written in coffeescript)
* js/utils/ for utility modules (written in coffeescript)
* scss/ for scss files

Note: If you add files, be sure that:

1. new coffeescript files are included in the 'concat' function of grunt.js
1. new scss files are imported by charts.scss (it would be rare to need to add a scss file!)

### Hacking on the showcase examples

All functionality added to the source code should be showcased in our examples. Grunt updates all dependencies. To update examples, simply follow these guidelines:

1. To update an existing example, simply update code in examples/js, testing to make sure it works (!)
1. To add a new route, simply create a new example js file in examples/js/ and then add the route to the appropriate link list array in index.js with a shortLink to your new js file

The main index.html page is generated dynamically, and the result of the js in your example file will be showcased directly above the pretty source code.