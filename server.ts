import express from 'express';
import cors from 'cors';
import { CooL, verifyEvidence } from 'cool-nwc';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize CooL Agent
const cool = new CooL({ applicationId: 'hackathon-mvp-agent' });

app.post('/api/execute-payment', async (req, res) => {
  try {
    const executionId = `exec-${Date.now()}`;
    const evidenceObj = await cool.record({
      type: 'payment',
      executionId,
      metadata: { 
        agent: 'Procurement Agent v3',
        vendor: 'Acme Supplies',
        purpose: 'Office inventory',
        amount: 2500
      }
    });

    res.json({
      recordId: evidenceObj.recordId,
      executionId: evidenceObj.executionId,
      evidence: evidenceObj.evidence
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/verify', async (req, res) => {
  try {
    const { evidence } = req.body;
    if (!evidence) {
      return res.status(400).json({ error: 'Missing evidence' });
    }

    const verdict = await verifyEvidence(evidence);
    res.json({ verified: verdict.ok, details: verdict });
  } catch (err: any) {
    // If the verification fundamentally fails or throws
    res.json({ verified: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

export default app;
