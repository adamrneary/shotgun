mocha.setup({ globals: ['__jp0', '__jp1', '__jp2', '__jp3'] });

describe('Shotgun', function() {
  var Shotgun    = require('shotgun');
  var expect     = chai.expect;
  var company1Id = '51bd6acd3af29d123999afc1';
  var company2Id = '81bd6caa3af29d123999afc2';

  beforeEach(function(done) {
    Shotgun.clear(done);
  });

  describe('Empty storage', function() {
    var data;
    var rawData = bootstrap();

    beforeEach(function(done) {
      var shotgun = new Shotgun({
        id: company1Id,
        url: 'http://localhost:7358/bootstrap.json',
        controlField: 'periods'
      });

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

  describe('Not empty, bootstrap returns nothing', function() {

  });

  describe('Not empty, bootstrap returns updated and deleted records', function() {

  });

  describe('Not empty, organization changed', function() {

  });
});
