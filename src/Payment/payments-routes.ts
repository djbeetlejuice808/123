import express from 'express';
import handler from './payments-handlers';

const router = express.Router();

router.post('/:userId/config', handler.createPaymentMethod)
  .get('/', handler.getAllPaymentMethods)
//   .get('/sellers/:sellerId/orders', handler.getOrdersBySeller) 


export default router;
