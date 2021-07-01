module.exports = function (req, res, next) {
  if (req.user.type !== 'Employee')
    return res.status(401).send({
      field: { message: 'Invalid Access denied.', name: 'Invalid Access' },
    });
  next();
};
