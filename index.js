const express = require('express');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const truckRoutes = require('./routes/truckRoutes');
const userRoutes = require('./routes/userRoutes');
const loadRoutes = require('./routes/loadRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');

const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
// Serving static files
app.use(express.static(`${__dirname}/public`));

app.use('/api/auth', authRoutes);
app.use('/api/users/me', userRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/loads', loadRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
