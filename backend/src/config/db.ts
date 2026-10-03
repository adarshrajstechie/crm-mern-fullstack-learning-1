/*
===============================================================================
SYNTAX DEFINITION & GUIDELINE: CLASSES & INSTANTIATION (OOP CONCEPTS)
===============================================================================
DEFINITION:
Object-Oriented Programming (OOP) uses 'Classes' as blueprints for creating 'Objects'.
- Class: Blueprint describing attributes (properties) and actions (methods).
- Constructor: A special function triggered automatically when creating a class instance.
- Instance/Object: A concrete realization of a class created using the 'new' keyword.

EXAMPLE SYNTAX:
class DatabaseConnector {
  private connectionString: string;

  constructor(uri: string) {
    this.connectionString = uri;
  }

  public connect(): void {
    console.log(`Connected to: ${this.connectionString}`);
  }
}

// Instantiating the object
const db = new DatabaseConnector("postgres://localhost");
db.connect();
===============================================================================
*/

import { PrismaClient } from '@prisma/client';

// Global Singleton Instance for Prisma Client
const prisma = new PrismaClient();

export default prisma;