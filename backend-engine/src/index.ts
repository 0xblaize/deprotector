import express from 'express';
import { CONFIG } from './config/networks';
import { apiRouter } from './api/webhook';
import { startMempoolStream } from './mempool/stream';

const app = express();

app.use(express.json());

// Register telemetry webhook endpoints
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
    res.json({
        status: 'ONLINE',
        service: 'Deprotector Counter-Drainer Engine',
        timestamp: new Date().toISOString()
    });
});

app.listen(CONFIG.port, () => {
    console.log(`=======================================================`);
    console.log(`🛡️ DEPROTECTOR COUNTER-DRAINER ENGINE IS NOW ONLINE`);
    console.log(`📡 Listening on Port: ${CONFIG.port}`);
    console.log(`=======================================================`);

    // Bootstrap Mempool WebSocket Stream
    startMempoolStream();
});
