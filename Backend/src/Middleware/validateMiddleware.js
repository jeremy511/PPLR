export const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: err.errors.map((e) => ({
        field: e.path[0],
        message: e.message,
      })),
    });
  }
};
