/*
===============================================================================
SYNTAX DEFINITION & GUIDELINE: ASYNCHRONOUS JAVASCRIPT / TYPESCRIPT (async/await)
===============================================================================
DEFINITION:
- async function: Declares an asynchronous function returning a Promise.
- await: Pauses execution until a Promise settles (resolves or rejects).
- try...catch: Handles runtime errors gracefully without crashing the server.

SYNTAX:
async function fetchData(): Promise<void> {
  try {
    const result = await databaseQuery();
    console.log(result);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}
===============================================================================
*/

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

// User Registration Handler
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Hash the raw password securely using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in PostgreSQL via Prisma ORM
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error during registration" });
  }
};

// User Login Handler
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: "Invalid Email or Password" });
      return;
    }

    // Compare provided password with stored hashed password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ error: "Invalid Email or Password" });
      return;
    }

    // Sign JWT Token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error during login" });
  }
};