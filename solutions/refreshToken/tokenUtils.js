const SECRET = 'token-secret'
const jsonwebtoken = require('jsonwebtoken')

function getToken(info, expiresIn) {
  return jsonwebtoken.sign(info, SECRET, { expiresIn })
}

module.exports = {
  SECRET,
  getToken
}