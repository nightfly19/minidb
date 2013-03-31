var fs = require("fs")
,path = require('path')
,data = require('../data');

var commands = {
    "replace facts": function(req, res, message){
        var settings = req.app.get('settings');
        var facts = JSON.parse(message.payload);
        data.replaceFacts(settings, facts);
        res.json({uuid: 0});},
    "replace catalog": function(req, res, message){
        var settings = req.app.get('settings');
        var catalog = message.payload;
        data.replaceCatalog(settings, catalog);
        res.json({uuid: 0});
    }};

exports.facts = function(req, res){
    var certname = req.params.certname;
    var settings = req.app.get('settings');
    data.facts(settings, certname, function(facts){
        res.json(facts)})};

exports.commands = function(req, res){
    var message = JSON.parse(req.body.payload);
    var command = message.command;
    console.log(command);
    if (commands[command]){
        commands[command](req, res, message);}
    else{
        res.send("no");}};

//var query_branches = {
//    "and"

var query_builder = function(query){
    var queryc = query.slice(0);
    var first = queryc[0];
    queryc.shift();
    switch (first){
    case 'and':
        if(queryc.length > 1){
            var temp_fn_a = query_builder(queryc[0]);
            queryc[0] = 'and';
            var temp_fn_b = query_builder(queryc);
            return function(resource, certname){
                //console.log("AND");
                return temp_fn_a(resource, certname) && temp_fn_b(resource, certname);};
        }
        else{
            return query_builder(queryc[0]);
        }
        break;
    case '=':
        var field = queryc[0];
        var value = queryc[1];
        switch (field){
        case 'certname':
            return function(resource, certname){return value == certname;};
            break;
        case 'tag':
            return function(resource, certname){
                return (resource.tags.indexOf(value) != -1) ? true : false;};
            break;
        default:
            if (Array.isArray(field)){
                return function(resource, certname){return resource[field[1]] == value;};
            }
            else{
                return function(resource, certname){return resource[field] == value;};
            }
            break;
        }
        break;
    case 'not':
        var temp_fn = query_builder(queryc[0]);
        return function(resource, certname){
            return !temp_fn(resource, certname);}
        break;
    default:
        console.log("Fail");
        console.log(first);
        console.log(query);
        return queryc;
    }
};

exports.resources = function (req, res){
    var query = JSON.parse(req.query.query);
    var catalog_dir = req.app.get('settings').catalog_dir;
    var found_resources = [];
    var filter_fn = query_builder(query);
    fs.readdir(catalog_dir,function(err, files){
        for(file in files){
            var certname = files[file];
            var catalog_path = catalog_dir+"/"+certname;
            var resources = JSON.parse(fs.readFileSync(catalog_path)).resources;
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
