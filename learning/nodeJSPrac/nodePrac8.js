// child processes
// allowing you to call out to the system to execute another script or
// call some system commands 
const cp = require('child_process');

const exec_options = {
    cwd : null,
    env : null,
    encoding : 'utf8',
    timeout : 0,
    maxBuffer : 200 * 1024,
    killSignal : 'SIGTERM'
};

// exec
// 2nd param: exec_options: optional object of options
// 3rd param: optional callback function to run once the command is done running
// this is the one to use under normal circumstances
cp.exec('ls -l', exec_options, (err, stdout, stderr) => {
    console.log('#1. exec');
    console.log(stdout); //  stdout is populated with a list of files
});

// exec sync
// similar to exec but rather than specifying a callback, 
// it waits for the command (ls -l) to finish and then it populates
// data with stdout
try {
    const data = cp.execSync('ls -l', exec_options);
    console.log('#2. exec sync');
    console.log(data.toString());
} catch(err){

}

const spawn_options = {
    cwd : null,
    env: null,
    detached: false
};

// spawn
// returns a child process object

const ls = cp.spawn('ls', ['-l'], spawn_options);


// on the data event for the stdout stream,
// give me the data that went to stdout
// unbuffered, unlike exec
ls.stdout.on('data', stdout => {
    console.log('#3. spawn');
    console.log(stdout.toString());
});

ls.stderr.on('data', stderr => {
    console.log(stderr.toString());
})

ls.on('close', code =>{

}); 

// spawn sync
const {stdout, stderr} = cp.spawnSync('ls', ['-l'], spawn_options);
console.log('#4. spawn sync');
console.log(stdout.toString());

// 2431



