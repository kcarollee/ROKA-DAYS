// event loop & concurrency model

/*
- the event loop is single threaded
- asynchronous : single threaded w/ concurrency
- the event loop lets Node.js achieve concurrency

*/

setTimeout(() => {
    console.log(2); // run console.log(2) after 0 ms
}, 0);
console.log(1);

/*
why is 1 printed out prior to 2?
 - setTimeout is an asynchronous function
 - () => {console.log(2);} is a callback
 - places the callback above onto the callback queue, which the function will execute later.
 
*/