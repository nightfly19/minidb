
var importProperties = function(a, b){
    var keys = Object.keys(b);
    for(i in keys){
        var key = keys[i];
        a[key] = b[key];
    }
    return a;
};

exports.merge = function(a, b){
    var output = importProperties({}, a);
    importProperties(output, b);
    return output;
};
