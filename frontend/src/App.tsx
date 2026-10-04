/*
===============================================================================
SYNTAX DEFINITION & GUIDELINE: REACT FUNCTIONAL COMPONENTS & HOOKS
===============================================================================
DEFINITION:
React components are JS/TS functions returning JSX (HTML inside JS).
- useState Hook: Manages reactive state within a component.
- useEffect Hook: Executes side effects (e.g., fetching API data on mount).

SYNTAX:
const [data, setData] = useState<Type>(initialValue);
useEffect(() => {
  // Executed when component mounts
}, []);
===============================================================================
*/

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: string;
}

export default function App() {
  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Form State for Creating New Customer
  const [name, setName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setToken(res.data.token);
      alert('Login successful!');
    } catch (err) {
      alert('Authentication failed');
    }
  };

  // Read Operation: Fetch Customers
  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (err) {
      alert('Failed to load customers');
    }
  };

  // Create Operation: Add Customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/customers',
        { name, email: custEmail, phone, company, status: 'LEAD' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomers();
      setName(''); setCustEmail(''); setPhone(''); setCompany('');
    } catch (err) {
      alert('Error creating customer');
    }
  };

  // Partial Update Operation (PATCH)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/customers/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomers();
    } catch (err) {
      alert('Error updating status');
    }
  };

  // Delete Operation
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
    } catch (err) {
      alert('Delete failed. Require ADMIN permissions');
    }
  };

  useEffect(() => {
    if (token) fetchCustomers();
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h2>CRM System - Login</h2>
        <form onSubmit={handleLogin}>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br/><br/>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br/><br/>
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Modern CRM Dashboard</h1>

      <h3>Create New Customer Record (REST POST)</h3>
      <form onSubmit={handleCreateCustomer}>
        <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Email" value={custEmail} onChange={e => setCustEmail(e.target.value)} required />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
        <input placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
        <button type="submit">Add Customer</button>
      </form>

      <hr style={{ margin: '30px 0' }} />

      <h3>Customer List (REST GET)</h3>
      <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Status (Partial Update)</th>
            <th>Actions (Delete)</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.company}</td>
              <td>
                {c.status}
                <button style={{ marginLeft: 10 }} onClick={() => handleUpdateStatus(c.id, 'CLIENT')}>
                  Set CLIENT
                </button>
              </td>
              <td>
                <button onClick={() => handleDelete(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}