const { pool } = require('../config/db');

module.exports = async function healthCheck(_req, res, next) {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      data: {
        status: 'ok',
        db: 'connected',
        timestamp: new Date().toISOString(),
      },
      message: 'Health check thành công',
    });
  } catch (error) {
    next(error);
  }
};
