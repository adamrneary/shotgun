use Rack::Static, 
  :urls => ["/css", "/js","/img"],
  :root => "examples"

map "/" do
  run lambda { |env|
    [
      200, 
      {
        'Content-Type'  => 'text/html', 
        'Cache-Control' => 'public, max-age=86400' 
      },
      File.open('examples/index.html', File::RDONLY)
    ]
  }
end

map "/styleguide" do
  run lambda { |env|
    [
      200, 
      {
        'Content-Type'  => 'text/html', 
        'Cache-Control' => 'public, max-age=86400' 
      },
      File.open('examples/styleguide.html', File::RDONLY)
    ]
  }
end