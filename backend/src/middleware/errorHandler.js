const errorHandler = (err, req, res, _next) => {
  console.error(
    `[ERROR] ${new Date().toISOString()} ${req.method} ${req.url}:`,
    err,
  );

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Serverda ichki xatolik yuz berdi",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
