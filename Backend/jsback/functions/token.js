const jwt = require('jsonwebtoken');

// Example function to generate a new token with updated claims
function generateNewToken(user, secret_key) {
    // Generate a new JWT token with updated claims
    const secretKey = secret_key;
  
    const newToken = jwt.sign(user, secretKey);
  
    return newToken;
  }

module.exports = generateNewToken;