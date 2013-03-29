var fs = require("fs");

var factPath = function(req, certname){
    return req.app.get('fact_dir')+"/"+certname;
};

var catalogPath = function(req, certname){
    return req.app.get('catalog_dir')+"/"+certname;
};

var commands = {
    "replace facts": function(req, res, message){
	var inner_payload = JSON.parse(message.payload);
	var name = inner_payload.name;
	var fact_filename = factPath(req,name);
	fs.writeFile(fact_filename, JSON.stringify(inner_payload),
		     function(err){res.json({uuid: 0});})},
    "replace catalog": function(req, res, message){
	var inner_payload = message.payload;
	var name = inner_payload.data.name;
	var catalog_filename = catalogPath(req,name);
	fs.writeFile(catalog_filename, JSON.stringify(inner_payload.data),
		     function(err){res.json({uuid: 0});});
    }};

exports.facts = function(req, res){
    var filename = factPath(req, req.params.certname);
    fs.exists(filename,function(exists){
	if (exists){
	    fs.readFile(filename, function(err, data){
		res.json(JSON.parse(data));});
	}
	else{
	    res.json({});
	}});
    res.send('{}');
};

exports.commands = function(req, res){
    var message = JSON.parse(req.body.payload);
    var command = message.command;
    console.log(command);
    if (commands[command]){
	commands[command](req, res, message);
    }
    else{
	res.send("no")
    }

};

exports.resources = function(req, res){
    console.log(req.query.query);
    res.json([]);
};