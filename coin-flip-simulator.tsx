import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

const CoinFlipSimulator = () => {
  const [numFlips, setNumFlips] = useState(198);
  const [fairness, setFairness] = useState(0.5);
  const [results, setResults] = useState({ heads: 104, tails: 94 });

  const simulateFlips = () => {
    let heads = 0;
    for (let i = 0; i < numFlips; i++) {
      if (Math.random() < fairness) {
        heads++;
      }
    }
    setResults({ heads, tails: numFlips - heads });
  };

  useEffect(() => {
    simulateFlips();
  }, [numFlips, fairness]);

  const chartData = [
    { name: 'Heads', value: results.heads },
    { name: 'Tails', value: results.tails },
  ];

  const calculatePercentage = (value) => ((value / numFlips) * 100).toFixed(2);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Coin Flip Simulator</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Number of Flips: {numFlips}</label>
        <Slider
          min={1}
          max={1000}
          step={1}
          value={[numFlips]}
          onValueChange={(value) => setNumFlips(value[0])}
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Probability of Heads: {fairness.toFixed(2)}</label>
        <Slider
          min={0.1}
          max={0.9}
          step={0.01}
          value={[fairness]}
          onValueChange={(value) => setFairness(value[0])}
        />
      </div>
      
      <Button onClick={simulateFlips} className="mb-4 bg-blue-500 hover:bg-blue-600">Rerun Simulation</Button>
      
      <div className="mb-4">
        <p>Heads: {results.heads} ({calculatePercentage(results.heads)}%)</p>
        <p>Tails: {results.tails} ({calculatePercentage(results.tails)}%)</p>
      </div>
      
      <BarChart width={400} height={300} data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill={(entry) => entry.name === 'Heads' ? '#4CAF50' : '#F44336'} />
      </BarChart>
    </div>
  );
};

export default CoinFlipSimulator;
