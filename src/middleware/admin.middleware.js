module.exports = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: "Access Denied: Admin only!" });
  }
};