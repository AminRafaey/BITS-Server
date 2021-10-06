const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const { token } = req.query;
  if (!token)
    return res.status(401).send({
      field: { message: 'Access denied. No token provided', name: 'No token' },
    });

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;

    next();
  } catch (ex) {
    res.status(401).send({
      field: { message: 'Unauthorized Access', name: 'Unauthorized' },
    });
  }
};
