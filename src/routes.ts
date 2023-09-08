import express from 'express';
import { validateIdentifyRequest, identify } from './controllers/identifyController';

const router = express.Router();

// Default route
router.get('/', (req, res) => {
    res.send('Identity Reconciliation Service is running!');
});

// Identify endpoint with validation
router.post('/identify', validateIdentifyRequest, identify);

export default router;
