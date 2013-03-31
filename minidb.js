
/**
 * Module dependencies.
 */

var express = require('express')
, https = require('https')
, path = require('path')
, ini = require('ini')
, fs = require('fs')
, apis = require('./apis')
, mergeObjects = require('./merge_objects');

var parseSettings = function(defaults_path, settings_path){
    var sections = [''];
    var relative_key = 'conf_dir';
    var paths = ['key_file', 'cert_file'];
    var defaults = ini.parse(fs.readFileSync(defaults_path, 'utf-8' ));
    var settings = settings_path ? ini.parse(fs.readFileSync(settings_path, 'utf-8')) : {};
    var merged = mergeObjects.merge(defaults, settings);
    for(i in sections){
        var section = sections[i];
        merged[section] = mergeObjects.merge(defaults[section] ?
                                        defaults[section] : {},
                                        settings[section] ?
                                        settings[section] : {});
    }

    for(i in paths){
        var key = paths[i];
        merged[key] = path.resolve(merged[relative_key], merged[key]);
    }
    return merged;
};

var settings = parseSettings("./defaults.ini", "./minidb.ini");

var httpsOptions = function(settings){
    return {
        key: fs.readFileSync(settings.key_file),
        cert: fs.readFileSync(settings.cert_file),
    };
};

var minidb = express();

minidb.configure(function(){
    minidb.set('port', process.env.PORT || 8081);
    minidb.set('views', __dirname + '/views');
    minidb.set('view engine', 'jade');
    minidb.set('data_dir', './data');
    minidb.set('fact_dir', minidb.get('data_dir')+'/facts');
    minidb.set('catalog_dir', minidb.get('data_dir')+'/catalogs');
    minidb.use(express.favicon());
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
https.createServer(httpsOptions(settings), minidb).listen(minidb.get('port'), function(){
    console.log("Express server listening on port " + minidb.get('port'));
});
