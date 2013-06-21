var globals = [];
for (var i = 0; i < 30; i++) globals.push('__jp' + i);
mocha.setup({ globals: globals});

describe('Shotgun', function() {
  var Shotgun = require('shotgun');
  var Storage = require('storage');
  var jsonp   = require('jsonp');
  var storage = new Storage('shotgun');
  var expect  = chai.expect;
  var shotgun;

  beforeEach(function(done) {
    jsonp('http://localhost:7358/reset.json', function(err1) {
      Shotgun.clear(function(err2) {
        shotgun = new Shotgun({
          id: '51bd6acd3af29d123999afc1',
          url: 'http://localhost:7358/bootstrap.json',
          field: 'periods'
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

    it('stores data to storage', function(done) {
      storage.all(function(err, values) {
        var keys = Object.keys(values);
        expect(keys).length(2);
        expect(keys).include('51bd6acd3af29d123999afc1');
        expect(keys).include('51bd6acd3af29d123999afc1-time');
        done(err);
      });
    });

    it('saves time', function(done) {
      storage.get('51bd6acd3af29d123999afc1-time', function(err, time) {
        expect(time).closeTo(Date.now(), 500);
        done(err);
      });
    });
  });

  describe('Not empty', function() {
    beforeEach(function(done) {
      shotgun.reset(bootstrap.all(), done);
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
          var oldData = bootstrap.all();
          expect(joinIds(oldData.periods)).not.equal(joinIds(data.periods));
          expect(joinIds(oldData.vendors)).not.equal(joinIds(data.vendors));
          expect(joinIds(oldData.accounts)).not.equal(joinIds(data.accounts));
          expect(joinIds(oldData.financial_summary)).not.equal(joinIds(data.financial_summary));
          expect(oldData.color_scheme).not.equal(data.color_scheme);
          expect(data.tasks).length(0);
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
        field: 'periods'
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
      storage.all(function(err, values) {
        var keys = Object.keys(values);
        expect(keys).length(4);
        expect(keys).include('81bd6caa3af29d123999afc2');
        expect(keys).include('81bd6caa3af29d123999afc2-time');
        expect(keys).include('51bd6acd3af29d123999afc1');
        expect(keys).include('51bd6acd3af29d123999afc1-time');
        done(err);
      });
    });

    it('has different sets of data', function() {
      expect(Object.keys(data)).length(6);
      expect(data.vendors).length(3);
      expect(data.financial_summary).length(5);
      expect(Object.keys(data2)).length(0);
    });
  });

  /**
   * Helpers
   */

  function joinIds(items) {
    return items.map(function(item) { return item.id; }).join('');
  }
});
