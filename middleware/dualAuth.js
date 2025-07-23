// middleware/dualAuth.js
import authMiddleware from './authMiddleware.js';
import { authenticateDevice } from './authenticateDevice.js';

export const dualAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer fwankey-')) {
    return authenticateDevice(req, res, next);
  }

  return authMiddleware(req, res, next);
};
