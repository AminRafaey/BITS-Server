module.exports = function (arr, req, res, next) {
  if (req.user.type === 'Admin') {
    next();
  } else if (
    req.user.type === 'Employee' &&
    arr.find((a) => req.user[a] === 'allow')
  ) {
    next();
  } else {
    return res.status(401).send({
      field: { message: 'Un-Authorized Access.', name: 'Invalid Access' },
    });
  }
};
