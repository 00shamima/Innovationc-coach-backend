module.exports = (req, res, next) => {
  if (req.user?.role === 'ADMIN' || req.user?.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      message: "Access Denied: Intha area-ku Admin permission venum!" 
    });
  }
};