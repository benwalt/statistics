import React, { useState, useRef, useEffect } from 'react';

const NormalDistribution = () => {
  const [a, setA] = useState(-1);
  const [b, setB] = useState(1);
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  const normalPDF = (x) => {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  };

  const normalCDF = (x) => {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
  };

  const erf = (x) => {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };

  const generatePoints = () => {
    const points = [];
    for (let x = -4; x <= 4; x += 0.08) {
      points.push({ x, y: normalPDF(x) });
    }
    return points;
  };

  const points = generatePoints();

  const calculateProbability = () => {
    if (a === b) return 0;
    if ((a === -4 && b === 4) || (a === 4 && b === -4)) return 1;
    if (Math.abs(a - b) === 4) return 0.5;
    if (a === -4) return normalCDF(b);
    if (a ===  4) return 1 - normalCDF(b);
    if (b ===  4) return 1 - normalCDF(a);
    if (b === -4) return normalCDF(a);
    return Math.abs(normalCDF(b) - normalCDF(a));
  };

  const probability = calculateProbability();

  const getProbabilityStatement = () => {
    const convertToX = (z) => (z * sigma + mu).toFixed(2);
    const variableLetter = mu === 0 && sigma === 1 ? 'Z' : 'X';
    if ((a === -4 && b === -4) || (a === 4 && b === 4)) return "P(∅)";
    if (a === b) return `P(${variableLetter} = ${convertToX(a)})`;
    if ((a === -4 && b === 4) || (a === 4 && b === -4)) return `P(${variableLetter})`;
    if (a === -4) return `P(${variableLetter} ≤ ${convertToX(b)})`;
    if (a === 4) return `P(${convertToX(b)} ≤ ${variableLetter})`;
    if (b === -4) return `P(${variableLetter} ≤ ${convertToX(a)})`;
    if (b === 4) return `P(${convertToX(a)} ≤ ${variableLetter})`;
    return `P(${convertToX(Math.min(a, b))} ≤ ${variableLetter} ≤ ${convertToX(Math.max(a, b))})`;
  };

  const handleMouseDown = (line) => {
    setDragging(line);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - svgRect.left) / svgRect.width * 800;
    const newValue = Math.max(-4, Math.min(4, (x - 400) / 100));

    if (dragging === 'a') {
      setA(Number(newValue.toFixed(2)));
    } else if (dragging === 'b') {
      setB(Number(newValue.toFixed(2)));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const getXAxisLabel = (z) => {
    return (z * sigma + mu).toFixed(2);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Normal Distribution Probabilities</h1>
      
      <div className="flex space-x-4 mb-4">
        <div>
          <label htmlFor="mu" className="mr-2">µ:</label>
          <input
            id="mu"
            type="number"
            value={mu}
            onChange={(e) => setMu(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label htmlFor="sigma" className="mr-2">σ:</label>
          <input
            id="sigma"
            type="number"
            value={sigma}
            onChange={(e) => setSigma(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded"
            min="0.1"
            step="0.1"
          />
        </div>
      </div>
      
      <svg 
        ref={svgRef}
        viewBox="0 0 800 300" 
        className="w-full h-64 bg-white border"
      >
        <line x1="0" y1="250" x2="800" y2="250" stroke="black" />
        <line x1="400" y1="0" x2="400" y2="300" stroke="black" />
        
        <path
          d={`M ${points.map(p => `${p.x * 100 + 400},${250 - p.y * 555.5}`).join(' L ')}`}
          fill="none"
          stroke="blue"
          strokeWidth="2"
        />
        
        <path
          d={`
            M ${Math.max(0, Math.min(a, b) * 100 + 400)},250
            L ${points.filter(p => p.x >= Math.max(-4, Math.min(a, b)) && p.x <= Math.min(4, Math.max(a, b)))
                     .map(p => `${p.x * 100 + 400},${250 - p.y * 555.5}`)
                     .join(' L ')}
            L ${Math.min(800, Math.max(a, b) * 100 + 400)},250
            Z
          `}
          fill="lightblue"
          fillOpacity="0.5"
        />
        
        {/* Invisible wider line for 'a' */}
        <line 
          x1={a * 100 + 400} y1="0" x2={a * 100 + 400} y2="300" 
          stroke="transparent" strokeWidth="20" 
          style={{cursor: 'ew-resize'}}
          onMouseDown={() => handleMouseDown('a')}
        />
        {/* Visible line for 'a' */}
        <line 
          x1={a * 100 + 400} y1="0" x2={a * 100 + 400} y2="300" 
          stroke="red" strokeWidth="2" strokeDasharray="5,5" 
        />
        
        {/* Invisible wider line for 'b' */}
        <line 
          x1={b * 100 + 400} y1="0" x2={b * 100 + 400} y2="300" 
          stroke="transparent" strokeWidth="20"
          style={{cursor: 'ew-resize'}}
          onMouseDown={() => handleMouseDown('b')}
        />
        {/* Visible line for 'b' */}
        <line 
          x1={b * 100 + 400} y1="0" x2={b * 100 + 400} y2="300" 
          stroke="red" strokeWidth="2" strokeDasharray="5,5"
        />
        
        <text x="0" y="270" textAnchor="start">{getXAxisLabel(-4)}</text>
        <text x="200" y="270" textAnchor="middle">{getXAxisLabel(-2)}</text>
        <text x="400" y="270" textAnchor="middle">{getXAxisLabel(0)}</text>
        <text x="600" y="270" textAnchor="middle">{getXAxisLabel(2)}</text>
        <text x="800" y="270" textAnchor="end">{getXAxisLabel(4)}</text>
      </svg>
      
      <p className="mt-6 text-center text-xl font-bold">
        {getProbabilityStatement()} = {probability.toFixed(6)}
      </p>
      
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-2 my-4" role="alert">
        <p className="font-bold">Instructions:</p>
        <p>Drag the vertical red lines to select the area for probability calculation.</p>
      </div>
      
      <hr className="mt-4 mb-2" />
      <p className="text-right italic">by Dr. B.Walter and Claude.ai</p>
    </div>
  );
};

export default NormalDistribution;
