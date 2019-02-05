exports.isLoggedin = (req, res, next) => {
  if (!req.user) {
    return res.status(400).send('User not logged in')
  }
  next();
}

exports.isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(400).send('User not admin')
  } next();
}
