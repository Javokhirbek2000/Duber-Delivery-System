const express = require('express');
const loadControllers = require('../controllers/loadControllers');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router
  .route('/')
  .get(loadControllers.getUsersLoads)
  .post(loadControllers.addLoad);

router.get('/active', loadControllers.getActiveLoads);
router.patch('/active/state', loadControllers.iterateToNextLoad);

router
  .route('/:id')
  .get(loadControllers.getLoad)
  .put(loadControllers.updateLoad)
  .delete(loadControllers.deleteLoad);

router.post('/:id/post', loadControllers.postLoad);
router.get('/:id/shipping_info', loadControllers.getShippingInfo);

module.exports = router;
