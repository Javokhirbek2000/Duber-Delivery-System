const express = require('express');
const truckControllers = require('../controllers/truckControllers');
const authMiddleware = require('../middleware/authMiddleware');
const truckMiddleware = require('../middleware/truckMIddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(truckMiddleware);
router
  .route('/')
  .get(truckControllers.getUsersTrucks)
  .post(truckControllers.addTruck);

router
  .route('/:id')
  .get(truckControllers.getTruck)
  .put(truckControllers.updateTruck)
  .delete(truckControllers.deleteTruck);

router.route('/:id/assign').post(truckControllers.assignTruck);

module.exports = router;
