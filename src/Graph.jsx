import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const colors = [
  'rgb(255, 99, 132)',
  'rgb(54, 162, 235)',
  'rgb(255, 206, 86)',
  'rgb(75, 192, 192)',
  'rgb(153, 102, 255)',
  'rgb(255, 159, 64)',
  'rgb(0, 200, 83)',
  'rgb(255, 87, 34)'
];

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    width: '100%',
    marginBottom: '20px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '16px'
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '20px'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: 'white',
    fontSize: '14px'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  chartContainer: {
    width: '100%',
    height: '400px'
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    border: '1px solid #ffcdd2',
    color: '#c62828',
    padding: '12px',
    borderRadius: '4px',
    width: '100%'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666'
  }
};

const Graph = () => {
  const [graphData, setGraphData] = useState([]);
  const [recordCount, setRecordCount] = useState(10); // Default to 10 records
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://10.217.55.246/json&n=${recordCount}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched data:", data); // Debug log
      setGraphData(data);
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // We're not setting up an interval here, as we want the user to control when to refresh
  }, []);

  const handleRecordCountChange = (e) => {
    setRecordCount(parseInt(e.target.value, 10));
  };

  const renderChart = () => {
    if (loading) {
      return <div style={styles.loading}>Loading data...</div>;
    }
    
    if (error) {
      return <div style={styles.errorMessage}>{error}</div>;
    }
    
    if (graphData.length === 0) {
      return <div style={styles.loading}>No data available</div>;
    }

    console.log("Graph data:", graphData); // Debug log

    // Extract CO2 values to determine min/max for the Y axis
    const co2Values = graphData
      .filter(data => data.co2 !== undefined)
      .map(data => data.co2);
    
    if (co2Values.length === 0) {
      return <div style={styles.errorMessage}>No valid CO2 data found in response</div>;
    }
    
    const minY = Math.min(...co2Values) - 50; // Add some padding
    const maxY = Math.max(...co2Values) + 50;
    
    // Create labels for x-axis (newest to oldest)
    const labels = [];
    for (let i = 0; i < graphData.length; i++) {
      // For each data point, add a label that shows its relative position
      // 0 is "Now", 1 is "1 reading ago", etc.
      const now = new Date();
      const formatted = now.toLocaleString(); 
      labels.push(formatted);
    }
    
    // Create the dataset with the CO2 values
    const datasets = [{
      label: 'CO2 Level',
      data: graphData.map(data => data.co2),
      borderColor: colors[0],
      backgroundColor: colors[0] + '33', // Add transparency
      fill: false,
      tension: 0.1,
    }];
    
    const chartData = {
      labels: labels,
      datasets: datasets,
    };
    
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { 
          mode: 'index', 
          intersect: false,
          callbacks: {
            title: function(tooltipItems) {
              return tooltipItems[0].label;
            }
          }
        },
        title: {
          display: true,
          text: `CO2 Levels - Last ${graphData.length} Readings`
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Time' },
          reverse: true, // Reverse axis to show newest data on the right
        },
        y: {
          min: minY,
          max: maxY,
          title: { display: true, text: 'PPM' },
        },
      },
    };
    
    return (
      <div style={styles.chartContainer}>
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>CO2 Level History</h1>
      </div>
      
      <div style={styles.controls}>
        <div>
          <label htmlFor="recordCount">Number of records: </label>
          <select 
            id="recordCount" 
            style={styles.select} 
            value={recordCount} 
            onChange={handleRecordCountChange}
          >
            {[2, 5, 10, 20, 30, 50, 75, 100].map(count => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
        </div>
        <button 
          style={styles.button} 
          onClick={fetchData} 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>
      
      {renderChart()}
    </div>
  );
};

export default Graph;