import express from 'express';
import { CONFIG, NETWORKS, PRIMARY_NETWORK } from './config/networks';
import { apiRouter } from './api/webhook';
import { startMempoolStream } from './mempool/stream';

function cors(req: express.Request, res: express.Response, next: express.NextFunction) {
    const origin = req.get('origin');
    if (CONFIG.corsOrigin === '*' || !origin || origin === CONFIG.corsOrigin) {
        res.setHeader('Access-Control-Allow-Origin', CONFIG.corsOrigin === '*' ? '*' : origin || CONFIG.corsOrigin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        if (req.method === 'OPTIONS') return res.sendStatus(204);
    }
    next();
}

const app = express();

app.use(cors);
app.use(express.json({ limit: '32kb' }));

app.get('/', (_req, res) => {
    res.json({ service: 'Deprotector Defensive Monitoring Engine', health: '/health', api: '/api/telemetry' });
});

let monitoringStatus = 'disabled';
app.set('monitoringStatus', monitoringStatus);

// Register telemetry webhook endpoints
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
    const primary = NETWORKS[PRIMARY_NETWORK];
    const configured = Boolean(primary?.httpRpc && primary?.chainId);
    res.status(200).json({
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
