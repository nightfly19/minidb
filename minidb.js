
/**
 * Module dependencies.
 */

var express = require('express')
, https = require('https')
, path = require('path')
, ini = require('ini')
, fs = require('fs')
, apis = require('./apis')
, parseSettings = require('./parse_settings');

var settings = parseSettings.parse("./defaults.ini", "./minidb.ini");

var minidb = express();

minidb.configure(function(){
    minidb.set('port', process.env.PORT || 8081);
    minidb.set('views', __dirname + '/views');
    minidb.set('settings', settings);
    minidb.use(express.logger('dev'));
    minidb.use(express.bodyParser());
    minidb.use(express.methodOverride());
    minidb.use(minidb.router);
    minidb.use(express.static(path.join(__dirname, 'public')));
});

minidb.configure('development', function(){
    minidb.use(express.errorHandler());
});

//Routes
minidb.post('/v2/commands', apis.v2.commands);
minidb.get ('/v2/nodes/:certname/facts', apis.v2.facts);
minidb.get ('/v2/resources', apis.v2.resources);

//Start server
https.createServer(parseSettings.httpsOptions(settings), minidb).listen(minidb.get('port'), function(){
    console.log("Express server listening on port " + minidb.get('port'));
});
