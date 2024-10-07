import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const generateData = (seed, stdDev, numPoints) => {
  let currentSeed = seed;
  const rng = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  const normalRandom = (mean, stdDev) => {
    const u1 = rng();
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z;
  };

  const data = [];
  for (let i = 0; i < numPoints; i++) {
    data.push(normalRandom(-2, stdDev));
  }
  for (let i = 0; i < numPoints; i++) {
    data.push(normalRandom(2, stdDev));
  }
  return data;
};

const HistogramWidget = () => {
  const [seed, setSeed] = useState(12345);
  const [stdDev, setStdDev] = useState(2);
  const [numPoints, setNumPoints] = useState(30);
  const [data, setData] = useState(() => generateData(seed, stdDev, numPoints));
  const [startValue, setStartValue] = useState(-6);
  const [binWidth, setBinWidth] = useState(0.1);

  const createHistogramData = () => {
    const histData = [];
    const numBins = Math.ceil((6 - startValue) / binWidth);
    const totalPoints = data.length;
    
    for (let i = 0; i < numBins; i++) {
      const binStart = startValue + i * binWidth;
      const binEnd = binStart + binWidth;
      const count = data.filter(d => d >= binStart && d < binEnd).length;
      const proportion = count / totalPoints;
      histData.push({ 
        binStart: binStart.toFixed(2), 
        binEnd: binEnd.toFixed(2), 
        proportion
      });
    }
    
    return histData;
  };

  const [histogramData, setHistogramData] = useState(createHistogramData());

  useEffect(() => {
    setData(generateData(seed, stdDev, numPoints));
  }, [seed, stdDev, numPoints]);

  useEffect(() => {
    setHistogramData(createHistogramData());
  }, [data, startValue, binWidth]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 p-2 shadow-md">
          <p>{`Bin: ${payload[0].payload.binStart} to ${payload[0].payload.binEnd}`}</p>
          <p>{`Proportion: ${(payload[0].value * 100).toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const getYAxisDomain = () => {
    const maxProportion = Math.max(...histogramData.map(d => d.proportion));
    return [0, Math.max(0.4, maxProportion)];
  };

  const generateNewData = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setSeed(newSeed);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Interactive Histogram for Bimodal Data</h2>
      <div className="mb-4">
        <label className="block mb-2">
          Start Value: {startValue.toFixed(2)}
          <input
            type="range"
            min={-6}
            max={-5.5}
            step={0.01}
            value={startValue}
            onChange={(e) => setStartValue(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">
          Bin Width: {binWidth.toFixed(2)}
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.1}
            value={binWidth}
            onChange={(e) => setBinWidth(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={histogramData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap={0}
          barGap={0}
        >
          <XAxis 
            dataKey="binStart" 
            type="number" 
            domain={[-6, 6]} 
            ticks={[-6, -4, -2, 0, 2, 4, 6]}
          />
          <YAxis 
            domain={getYAxisDomain} 
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="proportion" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <label className="block mb-2">
          Standard Deviation: {stdDev.toFixed(2)}
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.1}
            value={stdDev}
            onChange={(e) => setStdDev(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      <div className="mt-4">
        <label className="block mb-2">
          Number of Points per Mode: {numPoints}
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={numPoints}
            onChange={(e) => setNumPoints(parseInt(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      <button 
        onClick={generateNewData}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Generate New Data
      </button>
    </div>
  );
};

export default HistogramWidget;
