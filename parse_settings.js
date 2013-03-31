var ini = require('ini')
, fs = require('fs')
, path = require('path')
, mergeObjects = require('./merge_objects');

exports.parse = function(defaults_path, settings_path){
    var sections = [''];
    var settings_paths = ['key_file', 'cert_file'];
    var data_paths = ['fact_dir', 'catalog_dir'];
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

    for(i in settings_paths){
        var key = settings_paths[i];
        merged[key] = path.resolve(merged['conf_dir'], merged[key]);
    }

    for(i in data_paths){
        var key = data_paths[i];
        merged[key] = path.resolve(merged['data_dir'], merged[key]);
    }

    return merged;
};

exports.httpsOptions = function(settings){
    return {
        key: fs.readFileSync(settings.key_file),
        cert: fs.readFileSync(settings.cert_file),
    };
};
