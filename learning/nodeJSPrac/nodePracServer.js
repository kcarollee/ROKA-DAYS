// http server
const http = require('http');

// param: a callback for every connection made to the server
const server = http.createServer((req, res) => { // request & response
    let content = '';
    // append data as it comes in
    res.on('data', data =>{
        content += data;
    });

    // write the data back to the client
    // the callback is called once the request from the client ends

    res.on('end', () => {
        res.write(content); //  send the content
        res.end(); // end the response
    });
});
// port, host
server.listen(8080, '0.0.0.0');

 // the client sends the message over to the server,
 // the server takes that message and echoes it back to the client.