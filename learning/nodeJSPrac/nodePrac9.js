// cryptography
const crypto = require('crypto');
// supported hashes
console.log(crypto.getHashes());
console.log(crypto.getCiphers());

// random bytes
crypto.randomBytes(16, (err, buf) => {
    console.log(buf.toString('hex'));
}); 

let iv = crypto.randomBytes(16);

// create hash
let hash = crypto
    .createHash('sha256')
    .update('my message')
    .digest('hex');

console.log("hash " + hash); //  hashes are deteministic, so it doesn't chenge for the same param sent to .update


let secret_message = ':)';
let key = '12345678123456781234567812345678'; // aes 256 requires a 32 bit key

// type of encryption, key, iv (16 random bytes)
let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
// message, input encoding, output encoding
let encrypted = cipher.update(secret_message, 'utf-8', 'hex');
encrypted += cipher.final('hex');
console.log('encrypted: ' + encrypted);

let decipher = crypto.createCipheriv('aes-256-cbc', key, iv);
let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
decrypted += decipher.final('utf-8');

console.log('decrypted: ' + decrypted);
