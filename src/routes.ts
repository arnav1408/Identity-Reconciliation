import express from 'express';
import { validateIdentifyRequest, identifyEndpoint } from './controllers/identifyController';

const router = express.Router();

// Default route
router.get('/', (req, res) => {
    res.send('Identity Reconciliation Service is running!');
});

// Identify endpoint with validation
router.post('/identify', validateIdentifyRequest, identifyEndpoint);

export default router;
