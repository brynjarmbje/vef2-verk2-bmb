const bcrypt = require('bcrypt');
const password = '1234'; // Plaintext password
const saltRounds = 10; // Security requirement

bcrypt.hash(password, saltRounds, function(err, hash) {
  console.log(hash);
});
