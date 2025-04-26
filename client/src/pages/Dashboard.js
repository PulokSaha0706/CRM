// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    leads: 0,
    clients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats from backend
    axios
      .get('http://localhost:5000/api/stats')
      .then((response) => {
        setStats(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("eeee")
        console.error('Error fetching stats:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={styles.dashboard}>
        <h1 style={styles.header}>Loading Dashboard...</h1>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      <h1 style={styles.header}>CRM Dashboard</h1>
      <p style={styles.subtitle}>Overview of your CRM system</p>

      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3>Total Customers</h3>
          <p style={styles.statValue}>{stats.totalCustomers}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Leads</h3>
          <p style={styles.statValue}>{stats.leads}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Clients</h3>
          <p style={styles.statValue}>{stats.clients}</p>
        </div>
      </div>

      <div style={styles.summary}>
        <h2>What's New?</h2>
        <p>Here you can show some recent activities, such as new customers, recent updates, etc.</p>
      </div>
    </div>
  );
};

const styles = {
  dashboard: {
    padding: '20px',
    backgroundColor: '#f4f6f9',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#777',
    marginBottom: '40px',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    flex: '1',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  summary: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginTop: '40px',
  },
};

export default Dashboard;
