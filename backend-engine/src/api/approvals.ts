import express, { Request, Response } from 'express';
import { discoverApprovals } from '../approvalScanner';

export const approvalsRouter = express.Router();

approvalsRouter.get('/:wallet', async (req: Request, res: Response) => {
    try {
        return res.json({ approvals: await discoverApprovals(req.params.wallet) });
    } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to scan approvals' });
    }
});
