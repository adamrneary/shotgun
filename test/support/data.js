(function(exports) {
  exports.bootstrap = function(time) {
    return {
      periods: [
        { first_day: "2013-01-01", id:"51150257318033896f00013c" },
        { first_day: "2013-02-01", id:"51150257318033896f00013d" },
        { first_day: "2013-03-01", id:"51150257318033896f00013e" },
        { first_day: "2013-04-01", id:"51150257318033896f00013f" },
        { first_day: "2013-05-01", id:"51150257318033896f000140" },
        { first_day: "2013-06-01", id:"51150257318033896f000141" },
        { first_day: "2013-07-01", id:"51150257318033896f000142" },
        { first_day: "2013-08-01", id:"51150257318033896f000143" },
        { first_day: "2013-09-01", id:"51150257318033896f000144" },
        { first_day: "2013-10-01", id:"51150257318033896f000145" },
        { first_day: "2013-11-01", id:"51150257318033896f000146" },
        { first_day: "2013-12-01", id:"51150257318033896f000147" }],
      vendors: [
        { created_at: "2013-03-29T18:21:44Z", updated_at:"2013-03-29T18:21:44Z", "deleted_at": null, name: "Mutually Human", id: "5155dbba2bc51f31710000f9" },
        { created_at: "2013-03-29T18:21:44Z", updated_at:"2013-03-29T18:21:44Z", "deleted_at": null, name: "BuyDomains", id: "5155dbba2bc51f31710000f9" },
        { created_at: "2013-03-29T18:21:44Z", updated_at:"2013-03-29T18:21:44Z", "deleted_at": null, name: "Tumblr", id: "5155dbc72bc51f3171000168" }],
      accounts: [
        { "account_number":"20100", id: "5155dba02bc51f3171000041" },
        { "account_number":"14000", id: "5155dba52bc51f3171000074" }
      ],
      tasks: [],
      financial_summary: [
        { period_id: "51150257318033896f00012c", account_id: "5155dba02bc51f3171000041", amount_cents: -355.0 },
        { period_id: "51150257318033896f00012c", account_id: "5155dba52bc51f3171000074", amount_cents: 355.0 },
        { period_id: "51150257318033896f00012e", account_id: "5155dba02bc51f3171000041", vendor_id: "5155dbba2bc51f31710000f9","amount_cents":77685.0 },
        { period_id: "51150257318033896f00012e", account_id: "5155dba02bc51f3171000041", vendor_id: "5155dbc72bc51f3171000168","amount_cents":1181.0 }
      ],
      color_scheme: {"black":"#000000","dark_grey":"#333333","grey":"#E6E6E6","light_grey":"#F5F5F5","primary_dark":"#00455B", "id":"51bd6b50aa92303dcc000002"}
    };
  };
}).call(null, typeof exports !== 'undefined' ? exports : window);
