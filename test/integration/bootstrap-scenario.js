/* jshint undef: false */

/**
 * This is a casperjs test suite. It basically works so:
 *
 * 1. go to http://sterlingcooper.activecell.local:3000/,
 *    clear localStorage,
 *    login as don.drapper@sterlingcooper.com/111111,
 *    display intial load time, bootstrap and strikers,
 *    make a few changes.
 * 2. refresh page and login second time, check differents in bootstrap performance, see last changes,
 *    make all possible hard changes.
 * 3. login third time, check changes and logout.
 *
 * In order to run it, you need to:
 *
 * - install latest casperjs: `brew install casperjs --devel`
 * - start activecell server locally in different tab: `cd ../activecell && rails s`
 * - run casperjs test ./test/integration/bootstrap-scenario.js
 */

// help store and compare performance characteristics.
var perf = {};

casper.test.begin('Don logs in to http://sterlingcooper.activecell.local:3000/ at first time', function(test) {
  casper.start('http://sterlingcooper.activecell.local:3000/', function() {
    test.assertTitleMatch(/Activecell/, 'Don is in Activecell app');
    test.assertUrlMatch(/users\/sign_in$/, 'It was redirected to sign_in page');

    casper.evaluate(function(username, password) {
      localStorage.clear();
      $('#user_email').val(username);
      $('#user_password').val(password);
    }, 'don.draper@sterlingcooper.com', '111111');
    casper.click('#user_remember_me');
    casper.click('#login_button');

    casper.waitForUrl('http://sterlingcooper.activecell.local:3000/', null, captureError);
    casper.echo('The app loading...', 'INFO_BAR');
    casper.waitWhileSelector('#loader', null, captureError, 20000);
  });

  casper.then(function() {
    capture();
    perf = casper.evaluate(function() { return app.performance; });
    casper.echo('Page loaded during: ' + perf.total + ' (data refresh: ' +
      perf.data + ', strikers: ' + perf.strikers + ');', 'INFO_BAR');

    test.assertVisible('#main_nav');
    test.assertExists('li.active[data-nav="dashboard"]');
  });

  casper.run(function() {
    test.done();
  });
});

function capture() { casper.capture('tmp/capture.png'); }
function captureError() { casper.capture('tmp/capture-error.png'); }
