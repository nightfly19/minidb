
/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')
, user = require('./routes/user')
, v2 = require('./routes/v2')
, http = require('http')
, https = require('https')
, path = require('path')
, fs = require('fs');

var options = {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./cert.pem"),
};

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 8081);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('data_dir', './data');
    app.set('fact_dir', app.get('data_dir')+'/facts');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get ('/', routes.index);
app.get ('/:top_level', user.list);
app.post('/v2/commands', v2.commands);
app.get ('/v2/nodes/:certname/facts', v2.facts);

https.createServer(options, app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});