var multimethod = require('multimethod');

var compiler, compile;

var isForm = function(form){ return Array.isArray(form)};

var formExpand = function(form, callback){
    var cdr = form.slice(0);
    var car = form[0];
    cdr.shift();
    return callback(car, cdr);
};

exports.compile = compile = multimethod().dispatch(isForm)
    .when(true,function(form){
        return formExpand(form,function(symbol, args){return compiler(symbol, args);});
    })
    .when(false,function(form){
        return function(){ return form;}
    });

compiler = multimethod().dispatch(function(symbol, args){return symbol;})
    .when('and', function(symbol, args){
        if(args.length > 1){
            var temp_fn_a = compile(args[0]);
            args[0] = 'and';
            var temp_fn_b = compile(args);
            return function(resource, certname){
                return temp_fn_a(resource, certname) && temp_fn_b(resource, certname);
            };
        }
        else{
            return compile(args[0]);
        }
    })
    .when('not', function(symbol, args){
        var temp_fn = compile(args[0]);
        return function(resource, certname){
            return !temp_fn(resource, certname);
        }
    })
    .when('=', (function(){
        var eqlDispatch = multimethod().dispatch(function(field, value){return field;})
            .when('certname', function(field, value){
                return function(resource, certname){return value == certname;};
            })
            .when('tag', function(field, value){
                return function(resource, certname){
                    return (resource.tags.indexOf(value) != -1) ? true : false;
                };
            })
            .default( function(field, value){
                if (Array.isArray(field)){
                    return function(resource, certname){return resource[field[1]] == value;};
                }
                else{
                    return function(resource, certname){return resource[field] == value;};
                }
            });

        return function(symbol, args){
            var field = args[0];
            var value = args[1];
            return eqlDispatch(field, value);
        };
    })());
