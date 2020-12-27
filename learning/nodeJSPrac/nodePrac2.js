// server
// creates a new server that listens on 8080
// sends the text 'test' to all connections
const http = require('http');
// the request comes directly into the server and the output 
// goes right back out
let i = 0;
return http
    .createServer((req, res) =>{
        res.end('testing');
    })
    .listen(8080);