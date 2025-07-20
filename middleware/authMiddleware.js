import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'FWAN_SECRET_KEY';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token is provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info (userId, role) to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware; // ✅ ESM-compliant


