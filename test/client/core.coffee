table = null

describe "Table: ", ->
  it 'window.Shotgun is object', (done)->
    assert window.Shotgun
    assert typeof window.Shotgun is 'object'
    done()

  it 'window.Shotgun.Loader is function', (done)->
    assert window.Shotgun
    assert typeof window.Shotgun.Loader is 'function'
    done()

  it 'constructor', (done)->
    loader = new window.Shotgun.Loader
    assert loader
    done()
