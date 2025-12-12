import joi from "joi";

const validateUser = (req, res, next) => {
  const schema = joi.object({
    name: joi.string().max(100).required(),
    username: joi
      .string()
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .min(3)
      .max(30)
      .required()
      .messages({
        "string.pattern.base":
          "Username can only contain letters, numbers, underscores, and hyphens",
      }),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
  });
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return res
      .status(400)
      .json({ error: error.details.map((x) => x.message).join(", ") });
  }
  req.body = value;
  next();
};

export default validateUser;
