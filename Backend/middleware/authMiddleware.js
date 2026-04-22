const { admin, db } = require('../config/firebase');

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
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }

      let userRole = req.user.role;

      // Fallback: If role is not in the token (e.g. stale token), check Firestore
      if (!userRole) {
        console.log(`[Debug] Role missing in token for user ${req.user.uid}. Checking Firestore...`);
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (userDoc.exists) {
          userRole = userDoc.data().role;
          // Update req.user for subsequent use in the request lifecycle
          req.user.role = userRole;
        }
      }

      // Final fallback: if still no role, assume 'candidate' (safest default for job seekers)
      if (!userRole) {
        console.log(`[Debug] No role found for user ${req.user.uid} in token or Firestore. Defaulting to 'candidate'.`);
        userRole = 'candidate';
        req.user.role = userRole;
      }

      if (!roles.includes(userRole)) {
        console.log(`[Debug] Access Denied. User role: ${userRole}, Required: ${roles}`);
        return res.status(403).json({ 
          error: `Access Denied: Required role(s) [${roles.join(', ')}]`,
          debug: { userRole, requiredRoles: roles }
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error during authorization' });
    }
  };
};
