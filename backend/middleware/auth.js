import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔐 Auth Middleware - Headers received:', req.headers);
    console.log('🔐 Auth Middleware - Token received:', token ? 'YES' : 'NO');
    
    if (!token) {
      console.log('❌ No token provided in Authorization header');
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('🔐 Token decoded successfully for user ID:', decoded.id);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.id);
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid' 
      });
    }

    console.log('✅ User authenticated:', user.name, 'Role:', user.role, 'ID:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      console.error('JWT Error:', error.message);
    } else if (error.name === 'TokenExpiredError') {
      console.error('Token expired:', error.message);
    }
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid: ' + error.message 
    });
  }
};

export default auth;