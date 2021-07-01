module.exports = function (req, res, next) {
  if (req.user.type === 'Admin') {
    next();
  } else if (
    req.user.type === 'Employee' &&
    req.user.labelManagement === 'allow'
  ) {
    next();
  } else {
    return res.status(401).send({
      field: { message: 'Un-Authorized Access.', name: 'Invalid Access' },
    });
  }
};
