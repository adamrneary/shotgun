# Shotgun [![Build Status](https://circleci.com/gh/activecell/shotgun.png?circle-token=752e7092ed2b572b10c1c7e151f9723dc84e9817)](https://circleci.com/gh/activecell/shotgun)

  Bad-ass, bulletproof synced storage.

## Installation

    $ bower install git@github.com:activecell/shotgun.git#0.x.x --save

  Or copy [shotgun.js](https://github.com/activecell/shotgun/blob/master/index.js) and [indexed.js](https://github.com/ask11/indexed/blob/master/dist/indexed.js) to vendor folder.

## Example

```coffee
shotgun = new Shotgun
  id: app.company.id
  url: '/bootstrap.json'
  field: 'periods'
  allOrNothing: ['financial_summary']

shotgun.sync (err, data) ->
  # do something with data
```

## Server-side specification

  Some requires for */bootstrap.json* url:

  * parse `?t=<time>` query and returns data, which were updated after this period
  * returns json object, for example: { timestamp: 1376030171281, periods: [{id: 1, value: '2013-01-01'}] }
  * has to serve one field constantly, for example: periods. It's necessary to control db reseeds.
  * `timestamp` field is required, we can not trust clients to set time, they can change it someday.

## Development

  * `npm install` - to node & bower modules;
  * `npm test` - to ensure, that all tests pass;
  * `npm start` - to run local test server.

## API

### new Shotgun(options)

  Constructor to create shotgun instance with selected options:

  * `id` - storage id. For example when user switches between different companies and different sets of data
  * `url` - sync url. Url should be able to return all necessary data and handle `?t=time` params to return updated or removed data.
  * `field` - Select one collection, which serves always. It's necessary to control db reseeds.
  * `disable`*[optional]* - disable shotgun and use it as a simple proxy for `$.getJSON`. Useful on early stages of development.
  * `allOrNothing`*[optional]* - shotgun does not merge this field, if it's empty, it gets it from the cache else completely rewrite it. Useful for aggregated data, that updates rarely.

### Shotgun.clear([cb])

  Clear all data cached by shotgun.

### shotgun#sync(cb)

  Sync local storage with server. Callback returns 2 arguments:

  * `err` - handle error, if something bad happened
  * `data` - synced data

### shotgun#reset(data, cb)

  Reset storage with passed set of data.

```coffee
# clear storage
shotgun.reset {}, (err) ->

# set initial data
shotgun.reset { accounts: [], user: { id: 1, name: 'John Doe' }}, (err) ->
```
