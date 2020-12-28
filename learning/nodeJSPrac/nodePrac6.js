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

// or
/*
const util = require('util');
var read = util.promisify(fs.readFile);
read('test2.txt')
    .then(data => {
        console.log(data.toString());
    });
*/
// reading multiple files
const util = require('util');
var read = util.promisify(fs.readFile);

Promise
    // can take an array of promises and run them in parellel
    .all([

        read('test1.txt'),
        read('test2.txt'),
        read('test3.txt')
    ])
    // data is an array of all the values from above
    .then(data => {
        // unpack data's contents onto data1, data2, data3
        const [data1, data2, data3] = data;
        console.log(data1.toString());
        console.log(data2.toString());
        console.log(data3.toString());
    });