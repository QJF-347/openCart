const app = require('./server');

console.log('Registered routes:');
app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
        console.log(r.route.path);
    }
}); 