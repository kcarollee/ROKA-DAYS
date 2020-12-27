// promises

// resolve and reject are both callbacks
const promise = new Promise((resolve, reject) => {
    resolve('good'); // ignores .catch
     //reject('bad'); // ignores .then
})
// .then can be chained
// value : good
.then(value =>{
    console.log(value);
    return 1;
})
// value : 1
.then(value =>{
    console.log(value);
    return 2;
})
// value : 2
.then(value =>{
    
    console.log(value);
    return 3;
})
// value : 3
.then(value =>{
    throw 'really bad'; // err : really bad
    console.log(value);
    return 4;
})
// value : 4
.then(value =>{
    console.log(value);
    return 5;
})
.catch(err => {
    console.log(err);
})