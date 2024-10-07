import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

const BinomialNormalComparison = () => {
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);
  const [binomialData, setBinomialData] = useState([]);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });

  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const xScale = (x) => (x + 3) * (chartWidth / 6);
  const yScale = (y) => chartHeight - y * (chartHeight / 0.5);

  useEffect(() => {
    const calculateBinomial = () => {
      const data = [];
      for (let k = 0; k <= n; k++) {
        const coeff = factorial(n) / (factorial(k) * factorial(n - k));
        const prob = coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
        const x = (k - n * p) / Math.sqrt(n * p * (1 - p));
        const y = prob * Math.sqrt(n * p * (1 - p));
        data.push({ x, y, k });
      }
      setBinomialData(data);
    };

    calculateBinomial();
  }, [n, p]);

  const factorial = (num) => {
    if (num === 0 || num === 1) return 1;
    return num * factorial(num - 1);
  };

  const normalPdf = (x) => {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
  };

  const normalCurvePoints = () => {
    const points = [];
    for (let x = -3; x <= 3; x += 0.1) {
      points.push({ x, y: normalPdf(x) });
    }
    return points;
  };

  const barWidth = 1 / Math.sqrt(n * p * (1 - p));

  const handleMouseEnter = (point, event) => {
    const normalProb = normalPdf(point.x);
    const content = `
      k: ${point.k}
      Binomial Prob: ${point.y.toFixed(4)}
      Normal Prob: ${normalProb.toFixed(4)}
      Difference: ${(point.y - normalProb).toFixed(4)}
    `;
    setTooltip({
      show: true,
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
      content
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, show: false });
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Discrete Binomial and Continuous Normal</h1>
      
      <div className="mb-4">
        <label className="font-bold mr-2">density of count, n:</label>
        <Slider
          min={10}
          max={150}
          step={1}
          value={[n]}
          onValueChange={(value) => setN(value[0])}
        />
        <span className="ml-2">{n}</span>
      </div>
      
      <div className="mb-4">
        <label className="font-bold mr-2">p:</label>
        <Slider
          min={0.01}
          max={0.99}
          step={0.01}
          value={[p]}
          onValueChange={(value) => setP(value[0])}
        />
        <span className="ml-2">{p.toFixed(2)}</span>
      </div>

      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* X and Y axes */}
          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="black" />
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="black" />
          
          {/* X-axis label */}
          <text x={chartWidth / 2} y={chartHeight + 30} textAnchor="middle">
            Standardized Value
          </text>
          
          {/* Y-axis label */}
          <text
            transform={`rotate(-90) translate(${-chartHeight / 2}, -30)`}
            textAnchor="middle"
          >
            Probability
          </text>

          {/* Binomial distribution bars */}
          {binomialData.map((point, index) => (
            <rect
              key={index}
              x={xScale(point.x - barWidth / 2)}
              y={yScale(point.y)}
              width={xScale(barWidth) - xScale(0)}
              height={chartHeight - yScale(point.y)}
              fill="rgba(173, 216, 230, 0.5)"
              stroke="rgba(0, 0, 0, 0.5)"
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter(point, e)}
              onMouseLeave={handleMouseLeave}
            />
          ))}

          {/* Normal distribution curve */}
          <path
            d={`M${normalCurvePoints().map(p => `${xScale(p.x)},${yScale(p.y)}`).join(' L')}`}
            fill="none"
            stroke="rgba(0, 0, 0, 0.8)"
            strokeWidth="3"
          />
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            background: 'white',
            border: '1px solid black',
            padding: '5px',
            borderRadius: '5px',
            whiteSpace: 'pre-line'
          }}
        >
          {tooltip.content}
        </div>
      )}

      <p className="text-center mt-2">
        Normal pdf vs Binomial pmf<br />
        (normalized so μ=0, σ=1)
      </p>

      <hr className="my-4" />

      <p className="text-right italic">by Dr. B.Walter and Claude.ai</p>
    </div>
  );
};

export default BinomialNormalComparison;
