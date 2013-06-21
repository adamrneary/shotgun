var globals = [];
for (var i = 0; i < 20; i++) globals.push('__jp' + i);
mocha.setup({ globals: globals});

describe('Shotgun', function() {
  var Shotgun = require('shotgun');
  var Storage = require('storage');
  var jsonp   = require('jsonp');
  var expect  = chai.expect;
  var shotgun;

  beforeEach(function(done) {
    jsonp('http://localhost:7358/reset.json', function(err1) {
      Shotgun.clear(function(err2) {
        shotgun = new Shotgun({
          id: '51bd6acd3af29d123999afc1',
          url: 'http://localhost:7358/bootstrap.json',
          controlField: 'periods'
        });
        done(err1 || err2);
      });
    });
  });

  describe('Empty storage', function() {
    var data;

    beforeEach(function(done) {
      shotgun.sync(function(err, result) {
        data = result;
        done(err);
      });
    });

    it('gets object with keys', function() {
      expect(Object.keys(data)).length(6);
    });

    it('returns arrays of data with id field', function() {
      expect(data.periods).length(12);
      expect(data.vendors).length(3);
      expect(data.accounts).length(2);
      expect(data.tasks).length(0);
    });

    it('returns arrays with custom ids', function() {
      expect(data.financial_summary).length(5);
    });

    it('returns objects', function() {
      expect(Object.keys(data.color_scheme)).length(7);
    });
  });

  describe('Not empty', function() {
    beforeEach(function(done) {
      shotgun.reset(bootstrap.all(), function(err) {
        if (err) return done(err);
        setTimeout(done, 5); // emulate waiting
      });
    });

    it('bootstrap returns nothing', function(done) {
      shotgun.sync(function(err, data) {
        expect(Object.keys(data)).length(6);
        expect(data.periods).length(12);
        expect(data.vendors).length(3);
        expect(Object.keys(data.color_scheme)).length(7);
        done(err);
      });
    });

    it('bootstrap returns updated and deleted records', function(done) {
      jsonp('http://localhost:7358/change-data.json', function(err1) {
        shotgun.sync(function(err2, data) {
          expect(Object.keys(data)).length(6);
          expect(data.vendors).length(2); // one vendor removed
          expect(data.tasks).length(1); // new task added
          expect(data.financial_summary).length(5); // changed
          expect(data.accounts[0].account_number).equal('20101'); // one account changed
          done(err1 || err2);
        });
      });
    });

    it('handle reseed event', function(done) {
      jsonp('http://localhost:7358/reseed.json', function(err1) {
        shotgun.sync(function(err2, data) {
          var oldPeriods = joinPeriods(bootstrap.all().periods);
          var newPeriods = joinPeriods(data.periods);
          expect(oldPeriods).not.equal(newPeriods);

          expect(Object.keys(data)).length(7);
          expect(data.financial_summary).length(6);
          done(err1 || err2);
        });
      });
    });
  });

  describe('supports multiply instances', function() {
    var shotgun2, data, data2;

    beforeEach(function(done) {
      shotgun2 = new Shotgun({
        id: '81bd6caa3af29d123999afc2',
        url: 'http://localhost:7358/bootstrap2.json',
        controlField: 'periods'
      });

      shotgun.sync(function(err1, result) {
        data = result;
        shotgun2.sync(function(err2, result2) {
          data2 = result2;
          done(err1 || err2);
        });
      });
    });

    it('stores data separately', function(done) {
      var storage = new Storage('shotgun');
      storage.all(function(err, values) {
        var keys = Object.keys(values);
        expect(keys).length(4);
        expect(keys).includes('81bd6caa3af29d123999afc2');
        expect(keys).includes('81bd6caa3af29d123999afc2-time');
        expect(keys).includes('51bd6acd3af29d123999afc1');
        expect(keys).includes('51bd6acd3af29d123999afc1-time');
        done(err);
      });
    });

    it('has different sets of data', function(done) {
      expect(Object.keys(data)).length(6);
      expect(data.vendors).length(3);
      expect(data.financial_summary).length(4);

      expect(Object.keys(data2)).length(6);
      expect(data2.vendors).length(1);
      expect(data2.financial_summary).length(0);
    });
  });

  /**
   * Helpers
   */

  function joinPeriods(periods) {
    return periods.map(function(period) { return period.id; }).join('');
  }
});
