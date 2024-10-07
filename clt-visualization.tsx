import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CLTVisualization = () => {
  const [data, setData] = useState([]);
  const [densityEstimates, setDensityEstimates] = useState([]);
  const [numSamplesIndex, setNumSamplesIndex] = useState(0);
  const [distribution, setDistribution] = useState('uniform');

  const nValues = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

  const generateRandomNumber = useCallback(() => {
    switch (distribution) {
      case 'uniform':
        return Math.random() * 10;
      case 'exponential':
        return -5 * Math.log(1 - Math.random());
      case 'normal':
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return 5 + 4 * num;
      case 'binomial':
        let successes = 0;
        for (let i = 0; i < 15; i++) {
          if (Math.random() < 1/3) successes++;
        }
        return successes;
      default:
        return Math.random() * 10;
    }
  }, [distribution]);

  const generateData = useCallback(() => {
    const newData = Array.from({ length: 500 }, () =>
      Array.from({ length: 100 }, () => generateRandomNumber())
    );
    setData(newData);
  }, [generateRandomNumber]);

  useEffect(() => {
    generateData();
  }, [generateData]);

  useEffect(() => {
    if (data.length === 0) return;

    const estimates = nValues.map(n => {
      const averages = data.map(row => 
        row.slice(0, n).reduce((sum, val) => sum + val, 0) / n
      );
      const estimate = calculateDensityEstimate(averages);
      return { n, estimate };
    });
    setDensityEstimates(estimates);
  }, [data]);

  const calculateAdaptiveBandwidth = (n) => {
    // Start with a larger bandwidth for small samples
    const baseBandwidth = 0.5;
    // Reduce bandwidth as sample size increases, but not below a minimum
    return Math.max(baseBandwidth * Math.pow(n, -0.2), 0.2);
  };

  const calculateDensityEstimate = (values) => {
    const bandwidth = calculateAdaptiveBandwidth(values.length);
    
    const gaussianKernel = (x) => {
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    };
    
    const gridStep = 0.1;
    const grid = [];
    for (let x = 0; x <= 10; x += gridStep) {
      grid.push(x);
    }
    
    const density = grid.map((x) => {
      let sum = 0;
      values.forEach((val) => {
        sum += gaussianKernel((x - val) / bandwidth);
      });
      return { x: x, y: sum / (values.length * bandwidth) };
    });
    
    return density;
  };

  const interpolateColor = (t) => {
    const r = Math.round(255 * t);
    const b = Math.round(255 * (1 - t));
    return `rgb(${r},0,${b})`;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-1">Central Limit Theorem Visualization</h2>
      <h3 className="text-lg font-medium text-gray-600 mb-4">(Density Estimate from 500 Sample Means)</h3>
      <div className="mb-4 flex items-end space-x-4">
        <div className="w-48">
          <Select onValueChange={setDistribution} defaultValue={distribution}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uniform">Uniform(0,10)</SelectItem>
              <SelectItem value="exponential">Exponential(1/5)</SelectItem>
              <SelectItem value="normal">Normal(5,4)</SelectItem>
              <SelectItem value="binomial">Binomial(15,1/3)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of samples, n: {nValues[numSamplesIndex]}</label>
          <Slider
            min={0}
            max={nValues.length - 1}
            step={1}
            value={[numSamplesIndex]}
            onValueChange={(value) => setNumSamplesIndex(value[0])}
            className="w-full"
          />
        </div>
        <Button onClick={generateData} className="bg-blue-800 hover:bg-blue-900">
          Rerandomize
        </Button>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="x" type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
          <YAxis />
          <Tooltip />
          {densityEstimates.slice(0, numSamplesIndex + 1).map((est, index) => (
            <Line
              key={est.n}
              data={est.estimate}
              type="monotone"
              dataKey="y"
              stroke={interpolateColor(index / Math.max(numSamplesIndex, 1))}
              strokeWidth={3}
              dot={false}
              name={`n = ${est.n}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <hr className="mt-8 mb-2" />
      <p className="text-right italic text-sm text-gray-600">by Dr. B.Walter and Claude.ai</p>
    </div>
  );
};

export default CLTVisualization;
