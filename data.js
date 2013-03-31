var fs = require('fs');
var path = require('path');
var ensureDirectory
,ensureDirectorySync
,ensureDataDir;

exports.ensureDirectory = ensureDirectory = function(path, callback){
    fs.exists(path,function(exists){
        if(exists){callback();}
        else{fs.mkdir(path, callback)}
    });
};

exports.ensureDirectorySync = ensureDirectorySync = function(path){
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }
};

exports.ensureDataDir = ensureDataDir = function(root_dir){
    ensureDirectorySync(root_dir);
    ensureDirectorySync(path.resolve(root_dir, 'current'));
    ensureDirectorySync(path.resolve(root_dir, 'all'));
    ensureDirectorySync(path.resolve(root_dir, '.temp'));
};

exports.ensureDirectoriesExist = function(settings){
    ensureDirectorySync(settings.data_dir);
    ensureDataDir(settings.catalog_dir);
    ensureDataDir(settings.fact_dir);
};

exports.facts = function(settings, certname, callback){
    var current_name = path.resolve(settings.fact_dir, "current", certname);
    fs.exists(current_name,
              function(exists){
                  if (exists){
                      fs.readFile(current_name, function(err, data){
                          console.log(data);
                          callback(JSON.parse(data));})}
                  else{callback({});}});
    return {};};

exports.replaceFacts = function(settings, facts){
    var name = facts.name;
    var node_fact_dir = path.resolve(settings.fact_dir, "all", name);
    var perm_name = path.resolve(node_fact_dir, facts.timestamp);
    var temp_name = path.resolve(settings.fact_dir, ".temp", name);
    var current_name = path.resolve(settings.fact_dir, "current", name);
    ensureDirectory(
        node_fact_dir,
        function(){
            fs.writeFile(
                perm_name,
                JSON.stringify(facts),
                function(err){
                    fs.symlink(
                        perm_name,
                        temp_name,
                        function(){
                            fs.rename(
                                temp_name,
                                current_name,
                                function(err){
                                    console.log("Yay!");})

                        })})});};

exports.replaceCatalog = function(settings, catalog){
    var name = catalog.data.name;
    console.log(name);
};
