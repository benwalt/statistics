import React, { useState } from 'react';

const UniformDistributionComparison = () => {
  const [n, setN] = useState(2);
  
  const width = 600;
  const height = 400;
  const margin = { top: 40, right: 20, bottom: 60, left: 40 };
  
  const xScale = (x) => (x + 0.5) * (width - margin.left - margin.right) / 3 + margin.left;
  const yScale = (y) => height - margin.bottom - y * (height - margin.top - margin.bottom) / 0.7;
  
  const continuousPdf = [
    { x: -0.5, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0.5 },
    { x: 2, y: 0.5 },
    { x: 2, y: 0 },
    { x: 2.5, y: 0 },
  ];
  
  const discretePmf = Array.from({ length: n }, (_, i) => ({
    x: (2 * i + 1) / n,
    y: 0.5,
    width: 2 / n - 0.1 / n,
    label: ((n + i) / (n - 1)).toFixed(2),
  }));
  
  const xAxisLabels = discretePmf.filter((_, i) => {
    if (n <= 10) return true;
    if (n <= 20) return i % 2 === 0;
    if (n <= 50) return i % 5 === 0;
    return i % 10 === 0;
  });

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Discrete and Continuous Uniform</h1>
      
      <div className="mb-4">
        <label className="font-bold mr-2">Size of discrete uniform, n:</label>
        <input
          type="range"
          min="2"
          max="100"
          step="1"
          value={n}
          onChange={(e) => setN(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-600">Current value: {n}</span>
      </div>
      
      <svg width={width} height={height}>
        {/* Continuous PDF */}
        <path
          d={`M ${continuousPdf.map(p => `${xScale(p.x)},${yScale(p.y)}`).join(' L ')}`}
          stroke="black"
          strokeWidth="4"
          fill="none"
        />
        
        {/* Discrete PMF */}
        {discretePmf.map((bar, i) => (
          <rect
            key={i}
            x={xScale(bar.x - bar.width / 2)}
            y={yScale(bar.y)}
            width={xScale(bar.x + bar.width / 2) - xScale(bar.x - bar.width / 2)}
            height={yScale(0) - yScale(bar.y)}
            fill="lightblue"
            fillOpacity="0.7"
            stroke="blue"
            strokeWidth="1"
          />
        ))}
        
        {/* X-axis */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="black"
        />
        
        {/* X-axis labels */}
        {xAxisLabels.map((bar, i) => (
          <text
            key={i}
            x={xScale(bar.x)}
            y={height - margin.bottom + 20}
            textAnchor="middle"
            fontSize="12"
          >
            {bar.label}
          </text>
        ))}
        
        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="black"
        />
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.7].map((y) => (
          <text
            key={y}
            x={margin.left - 10}
            y={yScale(y)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="12"
          >
            {y.toFixed(2)}
          </text>
        ))}
      </svg>
      
      <p className="text-center mt-2">Uniform PDF vs Uniform PMF (normalized so that total area is 1)</p>
      
      <hr className="my-4" />
      
      <p className="text-right italic">by Dr. B.Walter and Claude.ai</p>
    </div>
  );
};

export default UniformDistributionComparison;
