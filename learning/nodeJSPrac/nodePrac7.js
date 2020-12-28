// async keyword allows you to use the await keyword in a function
// it also makes that function return a promise
// if a value is returned (say 'x'), Promise.resolve('x') is returned.
const fs = require('fs');
const util = require('util');
const read = util.promisify(fs.readFile);

var run = async () => {
    // promise version
    read('test1.txt')
        .then(data => {
            console.log('promise: ' + data.toString());
        });
    
    // async/ await version
    const data = await read('test1.txt');
    console.log('await/async: ' + data.toString());
};

run();

function a(){
    return Promise.resolve('a');
}

async function b(){
    return Promise.resolve('b');
}

async function c(){
    return 'c';
}

console.log(a());
console.log(b());
console.log(c());

var readMultFiles = async () => {
    const [data1, data2, data3] = 
        await Promise
            .all([
                read('test1.txt'),
                read('test2.txt'),
                read('test3.txt')
            ]);
    console.log(data1.toString());
    console.log(data2.toString());
    console.log(data3.toString());
};

readMultFiles();