// Promises

const fs = require('fs');

new Promise(
    (resolve, reject) => {
        fs.readFile('test2.txt', (err, data) => {
            if (err){
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    })
    .then(data => {
        console.log(data.toString());
    })
    .catch(err => {
        console.log(err);
    });
