// plugins/admin-plugin/routes/index.js

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const useragent = require('useragent');
const geoip = require('geoip-lite');

module.exports = (models, sequelize) => {
//   const { UserLogin } = models; // Assuming UserLogin model is defined in admin-plugin app
  const { User, UserLogin } = sequelize.models; // Assuming User model is defined in main app
  const { LoanCompany, LoanClient, LoanTransaction } = require('../../loan-plugin/models')(sequelize);

  // Middleware to check authentication and admin role
  const authMiddleware = require('../../../middleware/authMiddleware');

  // Middleware to check if user is admin
  const isAdminMiddleware = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Admins only.' });
    }
  };

  // Route to get total signed-up users
  router.get('/totalUsers', authMiddleware, isAdminMiddleware, async (req, res) => {
    try {
      const totalUsers = await User.count();
      res.status(200).json({ totalUsers });
    } catch (error) {
      console.error('Error fetching total users:', error);
      res.status(500).json({ error: 'Failed to fetch total users' });
    }
  });

  // Route to get total active users (logged in within last 30 days)
  router.get('/activeUsers', authMiddleware, isAdminMiddleware, async (req, res) => {
    try {
      const thirtyDaysAgo = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);
      const activeUsers = await UserLogin.count({
        where: {
          loginTime: {
            [Op.gte]: thirtyDaysAgo,
          },
        },
        distinct: true,
        col: 'userId',
      });
      res.status(200).json({ activeUsers });
    } catch (error) {
      console.error('Error fetching active users:', error);
      res.status(500).json({ error: 'Failed to fetch active users' });
    }
  });

  // Route to get login data for pie charts
  router.get('/loginData', authMiddleware, isAdminMiddleware, async (req, res) => {
    try {
      const logins = await UserLogin.findAll({
        attributes: ['userAgent', 'ipAddress'],
      });

      // Process user agents to get browsers and OS
      const browserCounts = {};
      const osCounts = {};

      // // We can use the 'useragent' package to parse user agent strings
      // const useragent = require('useragent');

      logins.forEach((login) => {
        const agent = useragent.parse(login.userAgent);
        const browser = agent.family;
        const os = agent.os.family;

        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
        osCounts[os] = (osCounts[os] || 0) + 1;
      });

      // Process IP addresses to get locations
      const locationCounts = {};

      // // For simplicity, we'll use 'geoip-lite' to get country from IP address
      // const geoip = require('geoip-lite');

      logins.forEach((login) => {
        const geo = geoip.lookup(login.ipAddress);
        const region = (geo && geo.region) || 'Unknown';

        locationCounts[region] = (locationCounts[region] || 0) + 1;
      });

      res.status(200).json({
        browserCounts,
        osCounts,
        locationCounts,
      });
    } catch (error) {
      console.error('Error fetching login data:', error);
      res.status(500).json({ error: 'Failed to fetch login data' });
    }
  });

  // Route to get total loan companies, clients, transactions
  router.get('/loanStats', authMiddleware, isAdminMiddleware, async (req, res) => {
    try {
      const totalCompanies = await LoanCompany.count();
      const totalClients = await LoanClient.count();
      const totalTransactions = await LoanTransaction.count();

      res.status(200).json({
        totalCompanies,
        totalClients,
        totalTransactions,
      });
    } catch (error) {
      console.error('Error fetching loan stats:', error);
      res.status(500).json({ error: 'Failed to fetch loan stats' });
    }
  });

  return router;
};
