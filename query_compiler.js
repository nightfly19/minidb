var compile;

exports.compile = compile = function(query){
    var queryc = query.slice(0);
    var first = queryc[0];
    queryc.shift();
    switch (first){
    case 'and':
        if(queryc.length > 1){
            var temp_fn_a = compile(queryc[0]);
            queryc[0] = 'and';
            var temp_fn_b = compile(queryc);
            return function(resource, certname){
                return temp_fn_a(resource, certname) && temp_fn_b(resource, certname);};
        }
        else{
            return compile(queryc[0]);
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
        var temp_fn = compile(queryc[0]);
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
