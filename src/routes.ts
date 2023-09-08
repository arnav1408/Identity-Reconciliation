import express from 'express';
import { validateIdentifyRequest, identify } from './controllers/identifyController';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Identity Reconciliation Service is running!');
});

router.post('/identify', validateIdentifyRequest, identify);

export default router;
