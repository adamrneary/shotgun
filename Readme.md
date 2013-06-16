# Shotgun

  A bad-ass bulletproof synced storage.

## Installation

  With [component.js](https://github.com/component/component)

    $ component install activecell/shotgun

  or copy [dist/shotgun.js](https://github.com/activecell/shotgun/blob/master/dist/shotgun.js) to your vendor folder.

## Example

```js
var Shotgun = require('shotgun')

var shotgun = new Shotgun({
  id: app.company.id,
  url: '/bootstrap.json',
  getId: activecell,
  controlField: 'periods',
  enable: true
});

shotgun.sync(function(err, data) {
  // do something with data
});
```

## API

### Shotgun(options)

  Create shotgun instance with selected options:

  * `id` - storage id. For example when user switches between different companies and different sets of data
  * `url` - sync url. Url should be able to return all necessary data and handle `?t=time` params to return updated or removed data.
  * `controlField` - Select one collection, which serves always. It's necessary to control db reseeds.
  * `enable`[optional] - disable shotgun and use it as a simple proxy for $.getJSON. Useful on early stages of development.

### shotgun.sync(cb)

  Sync local storage with server. Callback gets 2 paramethers:

  * err - handle error if something bad happened
  * data - synced data

## Development

  * `badass bootstrap` - to check system requirements and install node.js & component.js modules.
  * `npm test` - to ensure, that all tests pass.
