export default function DigitalBillingDashboard() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>📱 Digital Billing - Panchayat Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>

        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '15px', borderRadius: '12px' }}>
          <h3 style={{ color: '#065f46', fontSize: '14px', margin: '0 0 5px 0' }}>Total Collected</h3>
          <p style={{ color: '#064e3b', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>₹ 1,45,200</p>
          <span style={{ color: '#047857', fontSize: '12px' }}>320 Paid Households</span>
        </div>

        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '15px', borderRadius: '12px' }}>
          <h3 style={{ color: '#9f1239', fontSize: '14px', margin: '0 0 5px 0' }}>Total Pending Dues</h3>
          <p style={{ color: '#881337', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>₹ 48,500</p>
          <span style={{ color: '#be123c', fontSize: '12px' }}>95 Unpaid Households</span>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '15px', borderRadius: '12px' }}>
          <h3 style={{ color: '#1e40af', fontSize: '14px', margin: '0 0 5px 0' }}>Active Connections</h3>
          <p style={{ color: '#1e3a8a', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>415</p>
          <span style={{ color: '#2563eb', fontSize: '12px' }}>All Wards Connected</span>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '15px', borderRadius: '12px' }}>
          <h3 style={{ color: '#92400e', fontSize: '14px', margin: '0 0 5px 0' }}>Overdue Accounts</h3>
          <p style={{ color: '#78350f', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>12</p>
          <span style={{ color: '#b45309', fontSize: '12px' }}>Requires Notice</span>
        </div>

      </div>
    </div>
  );
}
