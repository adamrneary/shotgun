# shotgun.js [![Build Status](https://circleci.com/gh/activecell/shotgun.png?circle-token=752e7092ed2b572b10c1c7e151f9723dc84e9817)](https://circleci.com/gh/activecell/shotgun)

  Bad-ass, bulletproof synced storage.

## Installation

  Copy [shotgun.js](https://github.com/activecell/shotgun/blob/master/index.js) and [storage.js](https://github.com/ask11/storage/blob/master/dist/storage.js) to vendor folder.

## Example

```coffee
shotgun = new Shotgun({
  id: app.company.id,
  url: '/bootstrap.json',
  field: 'periods'
});

shotgun.sync (err, data) ->
  # do something with data
```

## API

### new Shotgun(options)

  Constructor to create shotgun instance with selected options:

  * `id` - storage id. For example when user switches between different companies and different sets of data
  * `url` - sync url. Url should be able to return all necessary data and handle `?t=time` params to return updated or removed data.
  * `field` - Select one collection, which serves always. It's necessary to control db reseeds.
  * `disable`[optional] - disable shotgun and use it as a simple proxy for `$.getJSON`. Useful on early stages of development.

### Shotgun.clear([cb])

  Clear all data cached by shotgun.

### #sync(cb)

  Sync local storage with server. Callback gets 2 paramethers:

  * `err` - handle error if something bad happened
  * `data` - synced data

### #reset(data, cb)

  Reset storage with passed set of data.
  Example to clear storage:

```coffee
shotgun.reset({}, function() {})
```

## Development

  * `badass bootstrap` - to check system requirements and install node.js & component.js modules.
  * `npm test` - to ensure, that all tests pass.
