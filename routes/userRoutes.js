const express = require('express');
const userControllers = require('../controllers/userControllers');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router
  .route('/')
  .get(userControllers.getUserInfo)
  .delete(userControllers.deleteUser);

router.route('/password').patch(userControllers.changeUserPassword);

module.exports = router;
