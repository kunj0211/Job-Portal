const { admin } = require('../config/firebase');

// Middleware to verify Firebase JWT tokens for protected routes
exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach the decoded user information to the request object
    req.user = decodedToken;
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

// Middleware to authorize specific roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access Denied: Required role(s) [${roles.join(', ')}]` 
      });
    }
    next();
  };
};
