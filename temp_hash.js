const bcrypt = require('bcrypt');
bcrypt.hash('123', 10).then(h => {
  console.log(h);
  process.exit(0);
});
