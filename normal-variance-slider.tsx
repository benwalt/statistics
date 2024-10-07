import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Slider } from "@/components/ui/slider"

const GaussianDensityPlot = () => {
  const [variance, setVariance] = useState(1);

  const gaussianDensity = (x, mean, variance) => {
    return (1 / Math.sqrt(2 * Math.PI * variance)) * Math.exp(-((x - mean) ** 2) / (2 * variance));
  };

  const data = useMemo(() => {
    const points = [];
    for (let x = -3; x <= 3; x += 0.05) {
      points.push({
        x: x,
        y: gaussianDensity(x, 0, variance),
      });
    }
    return points;
  }, [variance]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Effect of Variance on Spread</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Variance: {variance.toFixed(2)}
        </label>
        <Slider
          value={[variance]}
          onValueChange={(newValue) => setVariance(newValue[0])}
          min={0.1}
          max={2}
          step={0.05}
          className="mt-2"
        />
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[-3, 3]}
              tickCount={7}
              label={{ value: 'X', position: 'bottom' }}
            />
            <YAxis 
              domain={[0, 1.4]} 
              tickCount={8} 
              label={{ value: 'Density', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip
              formatter={(value) => value.toFixed(4)}
              labelFormatter={(label) => `x: ${label.toFixed(2)}`}
            />
            <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GaussianDensityPlot;
