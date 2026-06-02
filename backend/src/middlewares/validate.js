// Validate request body bằng Joi schema truyền vào
module.exports = function validate(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const err = new Error(error.details.map((d) => d.message).join('; '));
      err.status = 400;
      return next(err);
    }
    req.body = value;
    next();
  };
};
