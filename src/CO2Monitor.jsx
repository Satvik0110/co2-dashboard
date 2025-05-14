import { useState, useEffect } from 'react';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '24px'
  },
  timeSection: {
    marginBottom: '24px'
  },
  timeLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px'
  },
  timeValue: {
    fontWeight: '500'
  },
  readingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  ppmValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  statusBadge: {
    padding: '8px 24px',
    borderRadius: '50px',
    fontWeight: '600',
    fontSize: '18px',
    marginTop: '8px'
  },
  progressContainer: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '50px',
    height: '16px',
    marginTop: '24px'
  },
  progressBar: {
    height: '16px',
    borderRadius: '50px',
    transition: 'width 0.5s ease, background-color 0.5s ease'
  },
  scaleLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    fontSize: '12px',
    marginTop: '4px'
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    border: '1px solid #ffcdd2',
    color: '#c62828',
    padding: '12px',
    borderRadius: '4px'
  }
};

export default function CO2Monitor() {
  const [co2Data, setCo2Data] = useState({
    co2_ppm: null,
    status: 'Loading...',
    color: '#888888',
  });
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState('');

  const getCO2Status = (ppm) => {
    if (ppm === null) return { status: 'Loading...', color: '#888888' };
    
    if (ppm <= 600) return { status: 'Good', color: '#4CAF50' };
    if (ppm <= 800) return { status: 'Moderate', color: '#CDDC39' };
    if (ppm <= 1000) return { status: 'Poor', color: '#FF5722' };
    if (ppm <= 1200) return { status: 'Unhealthy', color: '#E91E63' };
    if (ppm <= 1500) return { status: 'Severe', color: '#9C27B0' };
    return { status: 'Hazardous', color: '#D50000' };
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString(); 
      setCurrentTime(formatted);
    };

    updateTime(); 

    const fetchData = async () => {
      try {
        const response = await fetch('http://10.217.55.246/json&n=1');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const { status, color } = getCO2Status(data[0].co2);
        
        setCo2Data({
          co2_ppm: data[0].co2,
          status,
          color
        });
        setError(null);
      } catch (err) {
        setError(`Failed to fetch CO2 data: ${err.message}`);
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up intervals for fetching data and updating time
    const dataIntervalId = setInterval(fetchData, 5000);
    const timeIntervalId = setInterval(updateTime, 5000);
    
    // Clean up intervals on component unmount
    return () => {
      clearInterval(dataIntervalId);
      clearInterval(timeIntervalId);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Live CO2 Reading</h1>
        
        {error ? (
          <div style={styles.errorMessage}>
            {error}
          </div>
        ) : (
          <>
            <div style={styles.timeSection}>
              <p style={styles.timeLabel}>Last Updated:</p>
              <p style={styles.timeValue}>{currentTime}</p>
            </div>
            
            <div style={styles.readingContainer}>
              <div style={{...styles.ppmValue, color: co2Data.color}}>
                {co2Data.co2_ppm !== null ? `${co2Data.co2_ppm} PPM` : 'Loading...'}
              </div>
              
              <div 
                style={{
                  ...styles.statusBadge,
                  backgroundColor: co2Data.color,
                  color: ['#4CAF50', '#CDDC39'].includes(co2Data.color) ? '#000' : '#fff'
                }}
              >
                {co2Data.status}
              </div>
              
              <div style={styles.progressContainer}>
                <div 
                  style={{
                    ...styles.progressBar,
                    width: co2Data.co2_ppm !== null ? `${Math.min(co2Data.co2_ppm / 2000 * 100, 100)}%`: 0,
                    backgroundColor: co2Data.color 
                  }}
                ></div>
              </div>
              
              <div style={styles.scaleLabels}>
                <span>0</span>
                <span>500</span>
                <span>1000</span>
                <span>1500</span>
                <span>2000+</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}