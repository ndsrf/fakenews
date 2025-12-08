import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { registerSchema, loginSchema } from '../utils/validation.js';

/**
 * Register a new user
 * First user automatically becomes super_admin
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Check if this is the first user
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        language: validatedData.language,
        role: isFirstUser ? 'super_admin' : 'user',
        isApproved: isFirstUser,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isApproved: true,
        language: true,
        createdAt: true,
      },
    });

    // If first user, generate token immediately
    if (isFirstUser) {
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        message: 'First user registered successfully as super admin',
        user,
        token,
      });
      return;
    }

    // For subsequent users, they need approval
    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if user is approved
    if (!user.isApproved) {
      res.status(403).json({ error: 'Your account is pending approval' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        language: user.language,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user information
 */
export async function getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isApproved: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout user (client-side token removal)
 */
export async function logout(req: Request, res: Response): Promise<void> {
  // JWT logout is handled client-side by removing the token
  res.status(200).json({ message: 'Logout successful' });
}
