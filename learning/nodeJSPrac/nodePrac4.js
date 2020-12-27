const fs = require('fs');

fs.readFile('test.txt', (err, data) => {
    console.log(data.toString());
});

// multiple async operations can happen out of order
// the first one to finish is the first one to execute
console.log('here');