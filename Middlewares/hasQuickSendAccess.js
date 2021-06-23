module.exports = function (req, res, next) {
  console.log(req.user);
  if (req.user.type === 'Admin') {
    next();
  } else if (
    req.user.type === 'Employee' &&
    (req.user.contactManagement === 'allow' || req.user.quickSend === 'allow')
  ) {
    next();
  } else {
    return res.status(401).send({
      field: { message: 'Un-Authorized Access.', name: 'Invalid Access' },
    });
  }
};
