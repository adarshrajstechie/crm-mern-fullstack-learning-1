import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';

import { registerUser, loginUser } from './controllers/authController';
import {
  createCustomer,
  getCustomers,
  fullUpdateCustomer,
  partialUpdateCustomer,
  deleteCustomer
} from './controllers/customerController';
import { authenticateToken, authorizeRoles } from './middleware/auth';
import { graphqlSchema, graphqlResolvers } from './graphql/schema';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Global Middleware Initialization
app.use(cors());
app.use(express.json()); // JSON Request Parser

// Auth REST Routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// REST API CRUD Routes for Customers (Protected with JWT Middleware)
app.post('/api/customers', authenticateToken, createCustomer);
app.get('/api/customers', authenticateToken, getCustomers);
app.put('/api/customers/:id', authenticateToken, fullUpdateCustomer);     // Full Update
app.patch('/api/customers/:id', authenticateToken, partialUpdateCustomer); // Partial Update
app.delete('/api/customers/:id', authenticateToken, authorizeRoles('ADMIN'), deleteCustomer); // Delete (Admin Only)

// GraphQL API Route
app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true // Enables interactive GraphiQL IDE interface in browser
}));

app.listen(PORT, () => {
  console.log(`CRM Server running in development mode on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint available at http://localhost:${PORT}/graphql`);
});