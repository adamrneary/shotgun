mocha.setup({ globals: ['__jp0', '__jp1', '__jp2', '__jp3', '__jp4', '__jp5'] });

describe('Shotgun', function() {
  var Shotgun    = require('shotgun');
  var expect     = chai.expect;
  var company1Id = '51bd6acd3af29d123999afc1';
  var company2Id = '81bd6caa3af29d123999afc2';
  var data, shotgun;

  beforeEach(function(done) {
    Shotgun.clear(function(err) {
      shotgun = new Shotgun({
        id: company1Id,
        url: 'http://localhost:7358/bootstrap.json',
        controlField: 'periods'
      });
      done(err);
    });
  });

  describe('Empty storage', function() {
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
      expect(data.financial_summary).length(4);
    });

    it('returns objects', function() {
      expect(Object.keys(data.color_scheme)).length(6);
    });
  });

  describe('Not empty', function() {
    beforeEach(function(done) {
      shotgun.reset(bootstrap(), done);
    });

    it('bootstrap returns nothing', function(done) {
      shotgun.sync(function(err, data) {
        expect(data.periods).length(12);
        expect(data.vendors).length(0);
        expect(data.accounts).length(0);
        expect(data.financial_summary).length(0);
        done(err);
      });
    });

    it('bootstrap returns updated and deleted records');
    it('change id');
    it('reseed');
  });
});
