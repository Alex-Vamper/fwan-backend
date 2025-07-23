export const authenticateDevice = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  // Get the expected key from environment variable
  const validCrateKey = process.env.CRATE_API_KEY || 'FWAN-CRATE-ACCESS-2025';

  if (token !== validCrateKey) {
    return res.status(403).json({ error: 'Invalid crate key' });
  }

  next();
};
