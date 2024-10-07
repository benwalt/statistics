import React, { useState, useEffect } from 'react';

const NormalDistribution = () => {
  const [mean, setMean] = useState(0);
  const [stdDev, setStdDev] = useState(1);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const newPoints = [];
    for (let x = -4; x <= 4; x += 0.04) {  // 200 points from -4 to 4
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
      newPoints.push({ x, y });
    }
    setPoints(newPoints);
  }, [mean, stdDev]);

  const mapX = (x) => (x + 4) * 100;  // Map x from [-4, 4] to [0, 800]
  const mapY = (y) => 200 - y * 200;

  const xTicks = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Normal Distribution</h1>
      
      <div className="mb-4">
        <label className="block mb-2">
          Mean μ: {mean.toFixed(2)}
          <input
            type="range"
            min="-3"
            max="3"
            step="0.01"
            value={mean}
            onChange={(e) => setMean(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">
          Std. Dev σ: {stdDev.toFixed(2)}
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.01"
            value={stdDev}
            onChange={(e) => setStdDev(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      
      <svg width="800" height="240" className="bg-gray-100">
        {/* Grid lines */}
        {xTicks.map(x => (
          <line key={`gridX${x}`} x1={mapX(x)} y1="0" x2={mapX(x)} y2="200" stroke="#e0e0e0" />
        ))}
        {yTicks.map(y => (
          <line key={`gridY${y}`} x1="0" y1={mapY(y)} x2="800" y2={mapY(y)} stroke="#e0e0e0" />
        ))}

        {/* Normal distribution curve */}
        <path
          d={`M ${points.map(p => `${mapX(p.x)},${mapY(p.y)}`).join(' L ')}`}
          fill="none"
          stroke="blue"
          strokeWidth="2"
        />

        {/* Axes */}
        <line x1="0" y1="200" x2="800" y2="200" stroke="black" />
        <line x1="0" y1="0" x2="0" y2="200" stroke="black" />

        {/* X-axis ticks and labels */}
        {xTicks.map(x => (
          <g key={`tickX${x}`}>
            <line x1={mapX(x)} y1="200" x2={mapX(x)} y2="205" stroke="black" />
            <text x={mapX(x)} y="220" textAnchor="middle">{x}</text>
          </g>
        ))}

        {/* Y-axis ticks and labels */}
        {yTicks.map(y => (
          <g key={`tickY${y}`}>
            <line x1="-5" y1={mapY(y)} x2="0" y2={mapY(y)} stroke="black" />
            <text x="-10" y={mapY(y)} textAnchor="end" alignmentBaseline="middle">{y.toFixed(1)}</text>
          </g>
        ))}
      </svg>
      
      <hr className="my-4" />
      
      <p className="text-right italic">by Dr. B.Walter and Claude.ai</p>
    </div>
  );
};

export default NormalDistribution;
