/*
===============================================================================
SYNTAX DEFINITION & GUIDELINE: EXPRESS MIDDLEWARE & JWT AUTHENTICATION
===============================================================================

DEFINITION OF MIDDLEWARE:
Middleware refers to software functions or components that sit between two 
separate layers, applications, or network boundaries to handle incoming 
requests and outgoing responses. In web application architecture, middleware 
acts as an intermediary pipeline that inspects, transforms, validates, or 
routes network traffic before it reaches the core application logic.

GENERAL SYNTAX OF MIDDLEWARE:
Express Middleware follows a standard 3-parameter function pattern:

    function middlewareName(req, res, next) {
      // 1. Inspect or modify request (req) or response (res)
      // 2. Execute logic (auth check, logging, body parsing)
      // 3. Either call next() to pass control OR send a response (res.send / res.json)
    }

- req (Request): Contains incoming HTTP data (headers, query params, body).
- res (Response): Handles sending responses back to the client.
- next (NextFunction): Triggers the execution of the next middleware in the stack.

-------------------------------------------------------------------------------

DEFINITION OF JWT (JSON WEB TOKEN):
A JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact 
and self-contained way for securely transmitting information between parties 
as a JSON object. This information can be verified and trusted because it is 
digitally signed using a secret key (HMAC algorithm) or a public/private key pair.

SYNTAX & STRUCTURE OF JWT:
A JWT string consists of three parts separated by dots (`.`):
    
    header.payload.signature

1. Header: JSON object specifying the token type (JWT) and signing algorithm (e.g., HS256).
2. Payload: JSON object containing claims (data like userId, role, expiration time).
3. Signature: Cryptographic hash produced by combining the encoded Header, 
   encoded Payload, and a secret key.

JWT Generation & Verification Syntax (jsonwebtoken library):
- Signing:    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
- Verifying:  const decoded = jwt.verify(token, secretKey);

-------------------------------------------------------------------------------

AUTHENTICATION vs AUTHORIZATION:
- Authentication: Verifying WHO a user is (e.g., verifying password/JWT token).
- Authorization: Verifying WHAT a user is allowed to do (e.g., ADMIN vs USER permissions).
===============================================================================
*/

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to store authenticated user details
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Middleware 1: Verify JWT Token (Authentication)
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  // Extract token from format: "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: "Access Denied: No Token Provided" });
    return;
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: string; role: string };
    req.user = verified;
    next(); // Pass control to next route handler
  } catch (error) {
    res.status(403).json({ error: "Invalid or Expired Token" });
  }
};

// Middleware 2: Role-Based Access Control (Authorization)
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: You do not have permissions for this action" });
      return;
    }
    next();
  };
};