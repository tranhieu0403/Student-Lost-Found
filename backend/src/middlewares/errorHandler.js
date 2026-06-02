// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, _req, res, _next) {
  const isDev = process.env.NODE_ENV === 'development';
  let status = err.status || 500;
  let message = err.message || 'Lỗi server';
  let errorCode = err.code || 'INTERNAL_ERROR';

  if (err.name === 'ValidationError') {
    status = 400;
    errorCode = 'VALIDATION_ERROR';
  }

  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Token không hợp lệ';
    errorCode = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token đã hết hạn';
    errorCode = 'TOKEN_EXPIRED';
  }

  if (isDev && err.stack) {
    console.error(err.stack);
  } else {
    console.error(message);
  }

  res.status(status).json({
    success: false,
    message,
    error: errorCode,
  });
};
