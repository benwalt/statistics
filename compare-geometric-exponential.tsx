import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const GeometricExponentialComparison = () => {
  const [n, setN] = useState(10);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [verticalLine, setVerticalLine] = useState(null);
  const [showGeometric, setShowGeometric] = useState(true);
  const [showExponential, setShowExponential] = useState(true);
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  const geometricPMF = (x, p) => p * Math.pow(1 - p, x);
  const exponentialPDF = (x, lambda) => lambda * Math.exp(-lambda * x);

  const generateGeometricData = (n, p) => {
    return Array.from({ length: n + 1 }, (_, i) => ({
      x: i * 10 / n,
      y: geometricPMF(i, p) * n / 10,
      originalX: i,
      originalY: geometricPMF(i, p)
    }));
  };

  const generateExponentialData = (lambda) => {
    return Array.from({ length: 100 }, (_, i) => ({
      x: i * 0.11,
      y: exponentialPDF(i * 0.11, lambda)
    }));
  };

  const geometricData = generateGeometricData(n, 5/n);
  const exponentialData = generateExponentialData(0.5);

  const xScale = (x) => x * (width - margin.left - margin.right) / 11 + margin.left;
  const yScale = (y) => height - margin.bottom - y * (height - margin.top - margin.bottom) / 0.6;

  const xAxisTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const yAxisTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];

  const handleMouseMove = (event, data) => {
    const svgRect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    const x = data.x;
    const geoY = data.y;
    const expY = exponentialPDF(x, 0.5);

    setVerticalLine(xScale(x));
    setTooltipContent({
      content: `at x=${x.toFixed(2)}<br/>exp=${expY.toFixed(4)}<br/>geo=${geoY.toFixed(4)}`,
      x: mouseX,
      y: mouseY
    });
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
    setVerticalLine(null);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Discrete Geometric and Continuous Exponential</h1>
      
      <div className="mb-4">
        <label className="font-bold mr-2">density of count, n:</label>
        <Slider
          min={10}
          max={100}
          step={1}
          value={[n]}
          onValueChange={(value) => setN(value[0])}
          className="w-64"
        />
        <span className="ml-2">{n}</span>
      </div>
      
      <div className="mb-4 flex space-x-4">
        <div className="flex items-center">
          <Checkbox
            id="showGeometric"
            checked={showGeometric}
            onCheckedChange={setShowGeometric}
          />
          <label htmlFor="showGeometric" className="ml-2">
            Geometric PMF
          </label>
        </div>
        <div className="flex items-center">
          <Checkbox
            id="showExponential"
            checked={showExponential}
            onCheckedChange={setShowExponential}
          />
          <label htmlFor="showExponential" className="ml-2">
            Exponential PDF
          </label>
        </div>
      </div>
      
      <svg width={width} height={height}>
        {showGeometric && (
          <g>
            {geometricData.map((d, i) => (
              <rect
                key={i}
                x={xScale(d.x) - 5 / n * (width - margin.left - margin.right) / 11}
                y={yScale(d.y)}
                width={10 / n * (width - margin.left - margin.right) / 11}
                height={height - margin.bottom - yScale(d.y)}
                fill="rgba(173, 216, 230, 0.5)"
                stroke="rgba(70, 130, 180, 0.8)"
                strokeWidth="1"
                onMouseMove={(e) => handleMouseMove(e, d)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </g>
        )}
        
        {showExponential && (
          <path
            d={`M ${exponentialData.map(d => `${xScale(d.x)},${yScale(d.y)}`).join(' L ')}`}
            fill="none"
            stroke="darkblue"
            strokeWidth="3"
          />
        )}
        
        {verticalLine && (
          <line
            x1={verticalLine}
            y1={margin.top}
            x2={verticalLine}
            y2={height - margin.bottom}
            stroke="red"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        )}
        
        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="black"
          strokeWidth="2"
        />
        
        {/* X-axis */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="black"
          strokeWidth="2"
        />

        {/* X-axis ticks and labels */}
        {xAxisTicks.map(tick => (
          <g key={tick} transform={`translate(${xScale(tick)},${height - margin.bottom})`}>
            <line y2="6" stroke="black" />
            <text y="20" textAnchor="middle" className="text-xs">{tick}</text>
          </g>
        ))}

        {/* Y-axis ticks and labels */}
        {yAxisTicks.map(tick => (
          <g key={tick} transform={`translate(${margin.left},${yScale(tick)})`}>
            <line x2="-6" stroke="black" />
            <text x="-10" dy="0.32em" textAnchor="end" className="text-xs">{tick.toFixed(1)}</text>
          </g>
        ))}

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 5}
          textAnchor="middle"
          className="text-sm"
        >
          x
        </text>

        {/* Y-axis label */}
        <text
          x={-height / 2}
          y={15}
          textAnchor="middle"
          transform={`rotate(-90 15 ${height / 2})`}
          className="text-sm"
        >
          Probability
        </text>
      </svg>
      
      {tooltipContent && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipContent.x + 10}px`,
            top: `${tooltipContent.y + 10}px`,
            background: 'white',
            border: '1px solid black',
            padding: '5px',
            borderRadius: '5px',
            whiteSpace: 'pre-line'
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent.content }}
        />
      )}
      
      <p className="text-center mt-2">Exponential pdf vs Geometric pmf (normalized so that prob = area)</p>
      
      <hr className="my-4" />
      
      <p className="text-right italic">by Dr. B.Walter and Claude.ai</p>
    </div>
  );
};

export default GeometricExponentialComparison;
