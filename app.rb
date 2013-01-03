require 'rubygems' 
require 'sinatra' 

get '/' do 
redirect 'index.html' 
end

get '/styleguide' do 
redirect 'styleguide.html' 
end