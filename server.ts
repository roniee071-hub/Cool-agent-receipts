import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CooL, verifyEvidence } from 'cool-nwc';

const app = express();

app.use(cors());
app.use(express.json());

const cool = new CooL({
  applicationId: 'hackathon-mvp-agent',
});

app.post('/execute-payment', async (_req, res) => {
  try {
    const executionId = `exec-${Date.now()}`;

    const evidenceObj = await cool.record({
      type: 'payment',
      executionId,
      metadata: {
        agent: 'Procurement Agent v3',
        vendor: 'Acme Supplies',
        purpose: 'Office inventory',
        amount: 2500,
      },
    });

    res.json({
      recordId: evidenceObj.recordId,
      executionId: evidenceObj.executionId,
      evidence: evidenceObj.evidence,
    });
  } catch (err: any) {
    console.error('Payment execution failed:', err);
    res.status(500).json({
      error: err?.message || 'Payment execution failed',
    });
  }
});

app.post('/verify', async (req, res) => {
  try {
    const { evidence } = req.body;

    if (!evidence) {
      return res.status(400).json({ error: 'Missing evidence' });
    }

    const verdict = await verifyEvidence(evidence);

    res.json({
      verified: verdict.ok,
      details: verdict,
    });
  } catch (err: any) {
    console.error('Verification failed:', err);

    res.json({
      verified: false,
      error: err?.message || 'Verification failed',
    });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

export default app;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`CooL Agent Receipts running on http://localhost:${PORT}`);
  });
}