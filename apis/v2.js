var data = require('../data')
,fs = require("fs")
,path = require('path')
,multimethod = require('multimethod')
,queryCompiler = require('../query_compiler');

var commandDispatcher = multimethod()
    .dispatch(function(command, message, settings, res){
        return command;
    }).when('replace facts', function(command, message, settings, res){
        var facts = JSON.parse(message.payload);
        data.replaceFacts(settings, facts);
        res.json({uuid: 0});
    }).when('replace catalog', function(command, message, settings, res){
        var catalog = message.payload;
        data.replaceCatalog(settings, catalog);
        res.json({uuid: 0});
    }).default(function(command, message, settings, res){
        console.log('unknown command: '+command);
        res.send('wtf');
    });

exports.facts = function(req, res){
    var certname = req.params.certname;
    var settings = req.app.get('settings');
    console.log('facts');
    console.log(certname);
    data.facts(settings, certname, function(facts){
        res.json(facts)})};

exports.commands = function(req, res){
    var message = JSON.parse(req.body.payload);
    var command = message.command;
    var settings = req.app.get('settings');
    console.log(command);
    commandDispatcher(command, message,  settings, res);
};

exports.resources = function (req, res){
    var query = JSON.parse(req.query.query);
    var catalog_dir = path.resolve(req.app.get('settings').catalog_dir,"current");
    var found_resources = [];
    var filter_fn = queryCompiler.compile(query);
    fs.readdir(catalog_dir,function(err, files){
        for(file in files){
            var certname = files[file];
            var catalog_path = path.resolve(catalog_dir,certname);
            var resources = JSON.parse(fs.readFileSync(catalog_path)).data.resources;
            for(i in resources){
                var resource = resources[i];
                if(filter_fn(resource, certname)){
                    found_resources.push(resource);
                }
            }
        }
        res.json(found_resources);
    });
};
