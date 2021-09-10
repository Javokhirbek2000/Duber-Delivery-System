const express = require('express');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const truckRoutes = require('./routes/truckRoutes');
const userRoutes = require('./routes/userRoutes');
const loadRoutes = require('./routes/loadRoutes');
const globalErrorHandler = require('./controllers/errorControllers');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/auth', authRoutes);
app.use('/api/users/me', userRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/loads', loadRoutes);

app.all('*', (req, res, next) => {
  res.status(400).json({
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

app.use(globalErrorHandler);

module.exports = app;
