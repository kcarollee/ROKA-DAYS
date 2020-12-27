var nums = [1, 2, 3, 4];

nums.forEach(num =>{
    console.log(num * 2);
});


// let: block scope
/*
for (let i = 0; i <= 4; i++){
    setTimeout(() =>{
        console.log(i);
    }, 1000);
}
*/
// variadic
// num can take any number or params
function sum(...nums){
    console.log(nums.reduce((acc, a) => a + acc, 0));
}

sum(1, 5, 6, 7, 9);

// spread op
var a = [1, 2, 3];
var b = [...a, 4, 5];
console.log(b);

var nums = [1, 2, 3];
var [one, two, three] = nums;

console.log(one, two, three); // 1, 2, 3

var [one, two] = [two, one];
console.log(one, two); // 2, 1