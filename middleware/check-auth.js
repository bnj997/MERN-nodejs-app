const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    //Authorization access: 'Bearer TOKEN'
    //Use .split(' ')[1] to access the 'TOKEN' part
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authentication failed');
    }
    //validate the token
    const decodedToken = jwt.verify(token, 'secret');
    //if good, we let request continue and add data to the request
    req.userData = {userId: decodedToken.userId};
    next();
  } catch(err) {
    const error = new HttpError('Authentication failed', 401);
    return next(error);
  }
}