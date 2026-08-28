import express from 'express';
import { CONFIG, NETWORKS, PRIMARY_NETWORK } from './config/networks';
import { apiRouter } from './api/webhook';
import { startMempoolStream } from './mempool/stream';

const app = express();

app.use(express.json({ limit: '32kb' }));

let monitoringStatus = 'disabled';
app.set('monitoringStatus', monitoringStatus);

// Register telemetry webhook endpoints
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
    const primary = NETWORKS[PRIMARY_NETWORK];
    const configured = Boolean(primary?.httpRpc && primary?.chainId);
    res.status(configured ? 200 : 503).json({
        status: configured ? 'READY' : 'CONFIGURATION_REQUIRED',
        service: 'Deprotector Defensive Monitoring Engine',
        primaryNetwork: PRIMARY_NETWORK,
        monitoring: configured && Boolean(primary.wsRpc) ? 'enabled' : 'disabled',
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
