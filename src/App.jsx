import { useState } from 'react';
import CO2Monitor from './CO2Monitor.jsx';
import Graph from './Graph.jsx';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    backgroundColor: '#333',
    color: 'white',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    padding: '8px 0',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ddd'
  },
  navButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  activeNavButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  contentArea: {
    flex: 1,
    overflow: 'auto'
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('monitor');

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: '24px', textAlign: 'center' }}>
          CO2 Monitoring System
        </h1>
      </header>
      
      <nav style={styles.nav}>
        <button 
          style={{
            ...styles.navButton,
            ...(currentPage === 'monitor' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentPage('monitor')}
        >
          Live Monitor
        </button>
        <button 
          style={{
            ...styles.navButton,
            ...(currentPage === 'graph' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentPage('graph')}
        >
          History Graph
        </button>
      </nav>
      
      <main style={styles.contentArea}>
        {currentPage === 'monitor' ? <CO2Monitor /> : <Graph numSensors={1} />}
      </main>
    </div>
  );
}