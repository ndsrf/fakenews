import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { updateUserSchema, updateRoleSchema } from '../utils/validation.js';

/**
 * Get all users (super admin only)
 */
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    throw error;
  }
}

/**
 * Get pending approval users (super admin only)
 */
export async function getPendingUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: {
        isApproved: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        language: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    throw error;
  }
}

/**
 * Approve a user (super admin only)
 */
export async function approveUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.isApproved) {
      res.status(400).json({ error: 'User is already approved' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isApproved: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isApproved: true,
        language: true,
      },
    });

    res.status(200).json({
      message: 'User approved successfully',
      user: updatedUser,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update user role (super admin only)
 */
export async function updateUserRole(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validatedData = updateRoleSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent changing own role
    if (req.user?.userId === id) {
      res.status(400).json({ error: 'Cannot change your own role' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: validatedData.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isApproved: true,
        language: true,
      },
    });

    res.status(200).json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete/deactivate user (super admin only)
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deleting own account
    if (req.user?.userId === id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    // Prevent deleting the last super admin
    if (user.role === 'super_admin') {
      const superAdminCount = await prisma.user.count({
        where: { role: 'super_admin' },
      });

      if (superAdminCount <= 1) {
        res.status(400).json({ error: 'Cannot delete the last super admin' });
        return;
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    throw error;
  }
}

/**
 * Update current user's profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const validatedData = updateUserSchema.parse(req.body);

    // Prepare update data
    const updateData: any = {};

    if (validatedData.name) {
      updateData.name = validatedData.name;
    }

    if (validatedData.language) {
      updateData.language = validatedData.language;
    }

    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        language: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    throw error;
  }
}
