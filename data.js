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

var replaceRecord = function(record_basedir, certname, longterm_name, data){
    var node_record_dir = path.resolve(record_basedir, "all", certname);
    var perm_name = path.resolve(node_record_dir, longterm_name);
    var temp_name = path.resolve(record_basedir, ".temp", certname);
    var current_name = path.resolve(record_basedir, "current", certname);
    var atomic_rename_cb = function(err){if(err){ throw err;}};
    var temp_symlink_cb = function(){
        fs.rename(temp_name, current_name, atomic_rename_cb);
    };
    var record_written_cb =  function(err){
        if(err){throw err;}
        fs.symlink( perm_name, temp_name, temp_symlink_cb)
    };
    var directory_exists_cb = function(){
        fs.writeFile(perm_name, data, record_written_cb);
    };
    ensureDirectory(node_record_dir, directory_exists_cb);
};

exports.replaceFacts = function(settings, facts){
    console.log(facts.name);
    replaceRecord(settings.fact_dir, facts.name, facts.timestamp, JSON.stringify(facts));
};

exports.replaceCatalog = function(settings, catalog){
    var name = catalog.data.name;
    console.log(name);
};
