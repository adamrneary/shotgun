(function(exports) {
  var bootstrap = exports.bootstrap = {};
  bootstrap.hasChange = false;
  bootstrap.hasReseed = false;

  function id(sufix) {
    var prefix = bootstrap.hasReseed ? '31150257318033896f000' : '5155dbc72bc51f3171000';
    return prefix + sufix;
  }

  function getData(method) {
    return function(time) {
      var options = method(time);
      if (time)
        return bootstrap.hasChange ? options.changed : options.nothing;
      else
        return options.all;
    };
  }

  var timestamp = getData(function(){ return {
    nothing: 1376030555704,
    all: 1376030171281,
    changed: 1376030576160
  };});

  var vendors = getData(function(){ return {
    nothing: [],
    all: [
      { updated_at: '2013-03-29T18:21:44Z', name: 'Mutually Human', id: id('014') },
      { updated_at: '2013-03-29T18:21:44Z', name: 'BuyDomains', id: id('015') },
      { updated_at: '2013-03-29T18:21:44Z', name: 'Tumblr', id: id('016') }
    ],
    changed: [
      { deleted_at: '2013-05-01:21:44Z', updated_at: '2013-05-01:21:44Z', name: 'Tumblr', id: id('016') }
    ]
  };});

  var accounts = getData(function(){ return {
    nothing: [],
    all: [
      { updated_at: '2013-04-14T11:22:04Z', account_number: '20100', id: id('017') },
      { updated_at: '2013-04-14T11:22:04Z', account_number: '14000', id: id('018') }
    ],
    changed: [
      { updated_at: '2013-05-01:19:14Z', account_number: '20101', id: id('017') }
    ]
  };});

  var tasks = getData(function(){ return {
    nothing: [],
    all: [],
    changed: [
      { updated_at: '2013-05-01:19:14Z', name: 'Simple task', id: id('018') }
    ]
  };});

  var financialSummary = getData(function(){ return {
    nothing: [],
    all: [
      { period_id: id('004'), account_id: id('017'), amount_cents: 45.0 },
      { period_id: id('004'), account_id: id('018'), amount_cents: 455.0 },
      { period_id: id('005'), account_id: id('017'), vendor_id: id('014'), amount_cents: 77685.0 },
      { period_id: id('006'), account_id: id('017'), vendor_id: id('016'), amount_cents: 1181.0 }
    ],
    changed: [
      { period_id: id('004'), account_id: id('018'), amount_cents: 500.0 },
      { period_id: id('005'), account_id: id('017'), vendor_id: id('014'), amount_cents: 88420.0 }
    ]
  };});

  var colorScheme = getData(function(){ return {
    nothing: {},
    all: {
      updated_at: '2013-04-14T11:22:04Z',
      black: '#000000',
      dark_grey: '#333333',
      grey: '#E6E6E6',
      light_grey: '#F5F5F5',
      primary_dark: '#00455B',
      id: id('013')
    },
    changed: {
      updated_at: '2013-04-24T11:22:04Z',
      black: '#333333',
      dark_grey: '#333333',
      grey: '#333333',
      light_grey: '#333333',
      primary_dark: '#333333',
      id: id('013')
    }
  };});

  bootstrap.all = function(time) {
    return {
      timestamp: timestamp(time),
      periods: [
        { first_day: '2013-01-01', id: id('001') },
        { first_day: '2013-02-01', id: id('002') },
        { first_day: '2013-03-01', id: id('003') },
        { first_day: '2013-04-01', id: id('004') },
        { first_day: '2013-05-01', id: id('005') },
        { first_day: '2013-06-01', id: id('006') },
        { first_day: '2013-07-01', id: id('007') },
        { first_day: '2013-08-01', id: id('008') },
        { first_day: '2013-09-01', id: id('009') },
        { first_day: '2013-10-01', id: id('010') },
        { first_day: '2013-11-01', id: id('011') },
        { first_day: '2013-12-01', id: id('012') }],
      vendors: vendors(time),
      accounts: accounts(time),
      tasks: tasks(time),
      financial_summary: financialSummary(time),
      color_scheme: colorScheme(time)
    };
  };
}).call(null, typeof exports !== 'undefined' ? exports : window);
