/*
===============================================================================
SYNTAX DEFINITION & GUIDELINE: REST API CRUD OPERATIONS & HTTP METHODS
===============================================================================
DEFINITION:
CRUD stands for Create, Read, Update, Delete.
- POST   : Create a new resource.
- GET    : Read/fetch resources.
- PUT    : Full Update (Replaces the whole entity with new payload).
- PATCH  : Partial Update (Modifies only specified fields).
- DELETE : Removes a resource.
===============================================================================
*/

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/db';

// 1. CREATE CUSTOMER (POST)
export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, company, status } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "User unauthorized" });
      return;
    }

    const customer = await prisma.customer.create({
      data: { name, email, phone, company, status, userId }
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: "Error creating customer record" });
  }
};

// 2. READ ALL CUSTOMERS (GET)
export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await prisma.customer.findMany({
      include: { user: { select: { name: true, email: true } } }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching customer records" });
  }
};

// 3. FULL UPDATE CUSTOMER (PUT)
export const fullUpdateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, status } = req.body;

    // Full replacement requires all mandatory fields present in request payload
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { name, email, phone, company, status }
    });

    res.json({ message: "Customer replaced (Full Update)", updatedCustomer });
  } catch (error) {
    res.status(500).json({ error: "Error during full update" });
  }
};

// 4. PARTIAL UPDATE CUSTOMER (PATCH)
export const partialUpdateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body; // Contains only fields to be modified

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData
    });

    res.json({ message: "Customer modified (Partial Update)", updatedCustomer });
  } catch (error) {
    res.status(500).json({ error: "Error during partial update" });
  }
};

// 5. DELETE CUSTOMER (DELETE)
export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({ where: { id } });

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting customer record" });
  }
};