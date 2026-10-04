/*
===============================================================================
SYNTAX DEFINITION & GUIDELINE: GRAPHQL SCHEMAS, QUERIES & MUTATIONS
===============================================================================
DEFINITION:
GraphQL provides a single endpoint for querying exact data required by the client.
- Schema: Types and operations definition using GraphQL Schema Language.
- Query: Read operations (analogous to GET in REST).
- Mutation: Write operations (analogous to POST, PUT, PATCH, DELETE in REST).
- Resolver: Functions that provide instructions to turn a GraphQL operation into data.
===============================================================================
*/

import { buildSchema } from 'graphql';
import prisma from '../config/db';

export const graphqlSchema = buildSchema(`
  type Customer {
    id: String!
    name: String!
    email: String!
    phone: String!
    company: String
    status: String!
  }

  type Query {
    getCustomers: [Customer!]!
    getCustomerById(id: String!): Customer
  }

  type Mutation {
    addCustomer(name: String!, email: String!, phone: String!, company: String, status: String): Customer!
  }
`);

export const graphqlResolvers = {
  getCustomers: async () => {
    return await prisma.customer.findMany();
  },
  getCustomerById: async (args: { id: string }) => {
    return await prisma.customer.findUnique({ where: { id: args.id } });
  },
  addCustomer: async (args: { name: string; email: string; phone: string; company?: string; status?: string }) => {
    // Attach dummy or admin user assignment for GraphQL mutation demo
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) throw new Error("No existing user found to associate record");

    return await prisma.customer.create({
      data: {
        name: args.name,
        email: args.email,
        phone: args.phone,
        company: args.company || '',
        status: args.status || 'LEAD',
        userId: defaultUser.id
      }
    });
  }
};