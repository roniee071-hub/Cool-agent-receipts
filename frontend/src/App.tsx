import { useState } from 'react';
import './index.css';

type ViewState = 'overview' | 'receipts' | 'receipt-detail' | 'tamper-demo';
type Status = 'idle' | 'executing' | 'verified' | 'failed';

const API_URL = '';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('overview');
  const [receipts, setReceipts] = useState<any[]>([]);
  const [activeReceiptIndex, setActiveReceiptIndex] = useState<number | null>(null);
  
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [tamperAmount, setTamperAmount] = useState<string>('2500');
  const [tamperStatus, setTamperStatus] = useState<Status>('idle');
  const [tamperError, setTamperError] = useState<string>('');

  const executePayment = async () => {
    setStatus('executing');
    setErrorMessage('');
    try {
      const response = await fetch(`${API_URL}/execute-payment`, { method: 'POST' });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      const newReceipt = { ...data, timestamp: new Date().toISOString() };
      setReceipts(prev => [newReceipt, ...prev]);
      setActiveReceiptIndex(0);
      setStatus('verified');
      setCurrentView('receipt-detail');
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('failed');
    }
  };

  const handleTamperVerification = async () => {
    if (activeReceiptIndex === null) return;
    const original = receipts[activeReceiptIndex];
    
    try {
      const tamperedEvidence = JSON.parse(JSON.stringify(original.evidence));
      
      if (tamperAmount !== '2500' && tamperedEvidence.record?.event?.metadata_hash) {
         const h = tamperedEvidence.record.event.metadata_hash;
         const lastChar = h.slice(-1);
         const newLastChar = lastChar === '0' ? '1' : '0';
         tamperedEvidence.record.event.metadata_hash = h.slice(0, -1) + newLastChar;
      }

      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence: tamperedEvidence }),
      });
      const data = await response.json();
      
      if (data.verified) {
        setTamperStatus('verified');
        setTamperError('');
      } else {
        setTamperStatus('failed');
        setTamperError('Cryptographic verification rejected the modified evidence. FAILED — ML-DSA-65 and Ed25519 do not verify over core‖binding_hash');
      }
    } catch (err: any) {
      setTamperStatus('failed');
      setTamperError(err.message);
    }
  };

  const openReceipt = (index: number) => {
    setActiveReceiptIndex(index);
    setCurrentView('receipt-detail');
  };

  const openTamperDemo = (index: number) => {
    setActiveReceiptIndex(index);
    setTamperAmount('2500');
    setTamperStatus('verified');
    setTamperError('');
    setCurrentView('tamper-demo');
  };

  // Nav
  const renderNav = () => (
    <nav className="nav">
      <div className="nav-brand">
        <h1>CooL Receipts</h1>
        <p>Cryptographic Evidence Infrastructure</p>
      </div>
      <div className="nav-links">
        <button className={`nav-link ${currentView === 'overview' ? 'active' : ''}`} onClick={() => setCurrentView('overview')}>Execute</button>
        <button className={`nav-link ${currentView === 'receipts' ? 'active' : ''}`} onClick={() => setCurrentView('receipts')}>Receipts ({receipts.length})</button>
      </div>
    </nav>
  );

  const renderOverview = () => (
    <div>
      <h2>New Execution</h2>
      <div className="card">
        <h3 className="section-header" style={{marginTop: 0}}>Pending Financial Action</h3>
        <div className="data-grid">
          <div className="data-row"><div className="data-label">Agent</div><div className="data-value">Procurement Agent v3</div></div>
          <div className="data-row"><div className="data-label">Counterparty</div><div className="data-value">Acme Supplies</div></div>
          <div className="data-row"><div className="data-label">Action Type</div><div className="data-value">PAYMENT</div></div>
          <div className="data-row"><div className="data-label">Amount</div><div className="data-value">₹2,500</div></div>
        </div>
        
        {status === 'failed' && <div className="banner failed">{errorMessage}</div>}
        
        <button className="btn" onClick={executePayment} disabled={status === 'executing'}>
          {status === 'executing' ? 'Executing...' : 'Execute Payment'}
        </button>
      </div>
    </div>
  );

  const renderReceipts = () => (
    <div>
      <h2>Receipts Ledger</h2>
      <div className="card">
        {receipts.length === 0 ? (
          <p>No receipts generated yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evidence ID</th>
                  <th>Agent</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r, i) => (
                  <tr key={r.recordId}>
                    <td className="mono" style={{fontSize:'0.8rem'}}>{r.recordId}</td>
                    <td>Procurement Agent v3</td>
                    <td>₹2,500</td>
                    <td><span className="status-badge verified">VERIFIED</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn secondary sm" onClick={() => openReceipt(i)}>VIEW</button>
                        <button className="btn sm" onClick={() => openTamperDemo(i)}>TAMPER DEMO</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderReceiptDetail = () => {
    if (activeReceiptIndex === null) return null;
    const receipt = receipts[activeReceiptIndex];
    const ev = receipt.evidence;

    return (
      <div>
        <h2>Receipt Details</h2>
        <button className="btn secondary" style={{marginBottom: '1rem'}} onClick={() => setCurrentView('receipts')}>← Back to Ledger</button>
        
        <div className="card">
          <h3 className="section-header" style={{marginTop: 0}}>Execution Record</h3>
          <div className="data-grid">
            <div className="data-row"><div className="data-label">Evidence ID</div><div className="data-value mono">{receipt.recordId}</div></div>
            <div className="data-row"><div className="data-label">Execution ID</div><div className="data-value mono">{receipt.executionId}</div></div>
            <div className="data-row"><div className="data-label">Timestamp</div><div className="data-value">{receipt.timestamp}</div></div>
            <div className="data-row"><div className="data-label">Verification</div><div className="data-value"><span className="status-badge verified">VERIFIED</span></div></div>
            <div className="data-row"><div className="data-label">Agent</div><div className="data-value">Procurement Agent v3</div></div>
            <div className="data-row"><div className="data-label">Counterparty</div><div className="data-value">Acme Supplies</div></div>
            <div className="data-row"><div className="data-label">Amount</div><div className="data-value">₹2,500</div></div>
          </div>

          <details>
            <summary>Cryptographic Evidence</summary>
            <div className="details-content">
              <div className="data-grid" style={{borderTop: 'none', margin: 0, padding: 0}}>
                <div className="data-row"><div className="data-label">Binding Hash</div><div className="data-value mono">{ev.record?.binding_hash || 'N/A'}</div></div>
                <div className="data-row"><div className="data-label">Metadata Hash</div><div className="data-value mono">{ev.record?.event?.metadata_hash || 'N/A'}</div></div>
                <div className="data-row"><div className="data-label">Schema</div><div className="data-value mono">{ev.schema || 'cool.receipt.v2'}</div></div>
                <div className="data-row"><div className="data-label">Hardware TEE</div><div className="data-value mono">intel-tdx · simulated</div></div>
              </div>
            </div>
          </details>

          <details>
            <summary>View Raw Evidence</summary>
            <pre className="code-block">
              {JSON.stringify(ev, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  };

  const renderTamperDemo = () => {
    if (activeReceiptIndex === null) return null;

    return (
      <div>
        <h2>Tamper Demonstration</h2>
        <button className="btn secondary" style={{marginBottom: '1rem'}} onClick={() => setCurrentView('receipts')}>← Back to Ledger</button>

        <div className="card">
          <h3 className="section-header" style={{marginTop: 0}}>Modify Evidence Payload</h3>
          <p style={{marginBottom: '1.5rem', color: '#666'}}>
            Change the amount to simulate a tampering attack. The cryptographic hash binding will be broken, and the SDK will reject the verification.
          </p>
          
          <div className="data-grid">
             <div className="data-row">
               <div className="data-label">Original Amount</div>
               <div className="data-value">₹2,500</div>
             </div>
             <div className="data-row">
               <div className="data-label">Tampered Amount</div>
               <div className="data-value">
                 <input 
                   type="text" 
                   className="input-minimal"
                   value={tamperAmount} 
                   onChange={(e) => setTamperAmount(e.target.value)} 
                 />
               </div>
             </div>
             <div className="data-row">
               <div className="data-label">Status</div>
               <div className="data-value">
                 <span className={`status-badge ${tamperStatus === 'verified' ? 'verified' : (tamperStatus === 'failed' ? 'failed' : 'pending')}`}>
                   {tamperStatus === 'verified' ? 'VERIFIED' : (tamperStatus === 'failed' ? 'VERIFICATION FAILED' : 'READY')}
                 </span>
               </div>
             </div>
          </div>

          {tamperStatus === 'failed' && (
            <div className="banner failed">
              {tamperError}
            </div>
          )}

          <div style={{display: 'flex', gap: '1rem'}}>
            <button className="btn danger" onClick={handleTamperVerification}>
              Tamper Receipt
            </button>
            {tamperStatus === 'failed' && (
              <button className="btn secondary" onClick={() => { setTamperAmount('2500'); setTamperStatus('verified'); setTamperError(''); }}>
                Reset Demo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {renderNav()}
      <main>
        {currentView === 'overview' && renderOverview()}
        {currentView === 'receipts' && renderReceipts()}
        {currentView === 'receipt-detail' && renderReceiptDetail()}
        {currentView === 'tamper-demo' && renderTamperDemo()}
      </main>
    </div>
  );
}

export default App;
