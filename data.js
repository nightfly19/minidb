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
