import React, { useState, useEffect, useRef } from 'react';

const NormalProbabilityCalculator = () => {
  const [type, setType] = useState("|Z| < ");
  const [quantile, setQuantile] = useState("0.47");
  const [probability, setProbability] = useState("0.681");
  const canvasRef = useRef(null);

  const normalPDF = x => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  const normalCDF = x => 0.5 * (1 + erf(x / Math.sqrt(2)));
  const erf = x => {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
    const p = 0.3275911;
    const t = 1 / (1 + p * x);
    const y = 1 - ((((a[4] * t + a[3]) * t + a[2]) * t + a[1]) * t + a[0]) * t * Math.exp(-x * x);
    return sign * y;
  };

  const inverseNormalCDF = p => {
    if (p <= 0 || p >= 1) throw new Error('Input must be between 0 and 1');
    const a = [-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00];
    const b = [-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01];
    const c = [-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00];
    const d = [7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
    const pLow = 0.02425, pHigh = 1 - pLow;
    let q, r;
    if (p < pLow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
    } else if (p <= pHigh) {
      q = p - 0.5;
      r = q * q;
      return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
    }
  };

  const calculateProbability = (q, selectedType) => {
    switch (selectedType) {
      case "|Z| > ": return 2 * (1 - normalCDF(q));
      case "|Z| < ": return 2 * normalCDF(q) - 1;
      case " Z  > ": return 1 - normalCDF(q);
      case " Z  < ": return normalCDF(q);
      default: return 0;
    }
  };

  const calculateQuantile = (p, selectedType) => {
    try {
      switch (selectedType) {
        case "|Z| > ": return inverseNormalCDF(1 - p/2);
        case "|Z| < ": return inverseNormalCDF((p + 1)/2);
        case " Z  > ": return inverseNormalCDF(1 - p);
        case " Z  < ": return inverseNormalCDF(p);
        default: return 0;
      }
    } catch (error) {
      alert("Error calculating quantile: " + error.message);
      return 0;
    }
  };

  const handleTypeChange = e => {
    const newType = e.target.value;
    let newQuantile = parseFloat(quantile);
    if ((newType === "|Z| < " || newType === "|Z| > ") && newQuantile < 0) {
      newQuantile = Math.abs(newQuantile);
      setQuantile(newQuantile.toFixed(2));
    }
    setType(newType);
    setProbability(calculateProbability(newQuantile, newType).toFixed(3));
  };

  const handleQuantileChange = e => {
    const input = e.target.value;
    setQuantile(input);
    if (input === "" || isNaN(parseFloat(input))) return;
    let newQuantile = parseFloat(input);
    newQuantile = type.includes("|Z|") ? Math.min(4, Math.abs(newQuantile)) : Math.max(-4, Math.min(4, newQuantile));
    setProbability(calculateProbability(newQuantile, type).toFixed(3));
  };

  const handleProbabilityChange = e => {
    const input = e.target.value;
    setProbability(input);
    if (input === "" || isNaN(parseFloat(input))) return;
    const newProbability = parseFloat(input);
    const adjustedProbability = Math.max(0.001, Math.min(0.999, newProbability));
    setQuantile(calculateQuantile(adjustedProbability, type).toFixed(2));
  };

  const handleQuantileBlur = () => {
    if (quantile === "" || isNaN(parseFloat(quantile))) {
      setQuantile("0.00");
      setProbability(calculateProbability(0, type).toFixed(3));
    } else {
      let newQuantile = parseFloat(quantile);
      newQuantile = type.includes("|Z|") ? Math.min(4, Math.abs(newQuantile)) : Math.max(-4, Math.min(4, newQuantile));
      setQuantile(newQuantile.toFixed(2));
      setProbability(calculateProbability(newQuantile, type).toFixed(3));
    }
  };

  const handleProbabilityBlur = () => {
    if (probability === "" || isNaN(parseFloat(probability))) {
      setProbability("0.500");
      setQuantile(calculateQuantile(0.5, type).toFixed(2));
    } else {
      const newProbability = parseFloat(probability);
      const adjustedProbability = Math.max(0.001, Math.min(0.999, newProbability));
      setProbability(adjustedProbability.toFixed(3));
      setQuantile(calculateQuantile(adjustedProbability, type).toFixed(2));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 20);
    ctx.lineTo(width, height - 20);
    ctx.moveTo(20, 0);
    ctx.lineTo(20, height);
    ctx.stroke();
    ctx.fillStyle = 'black';
    for (let i = -4; i <= 4; i++) {
      const x = (i + 4) * width / 8;
      ctx.fillText(i.toString(), x, height - 5);
    }
    for (let i = 0; i <= 5; i++) {
      const y = height - (i * height / 6) - 20;
      ctx.fillText((i / 10).toFixed(1), 0, y);
    }
    const q = parseFloat(quantile);
    const canvasQ = (q + 4) * width / 8;
    const canvasNegQ = (-q + 4) * width / 8;
    ctx.fillStyle = '#ff9999';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    if (type === "|Z| > ") {
      ctx.moveTo(0, height - 20);
      for (let x = -4; x <= -q; x += 0.01) {
        ctx.lineTo((x + 4) * width / 8, height - (normalPDF(x) * height / 0.5) - 20);
      }
      ctx.lineTo(canvasNegQ, height - 20);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(canvasQ, height - 20);
      for (let x = q; x <= 4; x += 0.01) {
        ctx.lineTo((x + 4) * width / 8, height - (normalPDF(x) * height / 0.5) - 20);
      }
      ctx.lineTo(width, height - 20);
    } else if (type === " Z  > ") {
      ctx.moveTo(canvasQ, height - 20);
      for (let x = q; x <= 4; x += 0.01) {
        ctx.lineTo((x + 4) * width / 8, height - (normalPDF(x) * height / 0.5) - 20);
      }
      ctx.lineTo(width, height - 20);
    } else if (type === " Z  < ") {
      ctx.moveTo(0, height - 20);
      for (let x = -4; x <= q; x += 0.01) {
        ctx.lineTo((x + 4) * width / 8, height - (normalPDF(x) * height / 0.5) - 20);
      }
      ctx.lineTo(canvasQ, height - 20);
    } else if (type === "|Z| < ") {
      ctx.moveTo(canvasNegQ, height - 20);
      for (let x = -q; x <= q; x += 0.01) {
        ctx.lineTo((x + 4) * width / 8, height - (normalPDF(x) * height / 0.5) - 20);
      }
      ctx.lineTo(canvasQ, height - 20);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0000FF';
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 3;
    if (type === "|Z| > " || type === "|Z| < ") {
      ctx.beginPath();
      ctx.moveTo(canvasQ, height - 20);
      ctx.lineTo(canvasQ, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(canvasNegQ, height - 20);
      ctx.lineTo(canvasNegQ, 0);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(canvasQ, height - 20);
      ctx.lineTo(canvasQ, 0);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    for (let x = -4; x <= 4; x += 0.01) {
      const y = normalPDF(x);
      const canvasX = (x + 4) * width / 8;
      const canvasY = height - (y * height / 0.5) - 20;
      x === -4 ? ctx.moveTo(canvasX, canvasY) : ctx.lineTo(canvasX, canvasY);
    }
    ctx.stroke();
  }, [type, quantile, probability]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-5 text-shadow">Standard Normal Quantiles and Probabilities</h1>
      <div className="text-xl font-bold mb-5 flex items-center justify-center">
        P(
        <select value={type} onChange={handleTypeChange} className="mx-1 p-1 border border-gray-300 rounded text-lg">
          <option value="|Z| > ">|Z| ≥ </option>
          <option value="|Z| < ">|Z| ≤ </option>
          <option value=" Z  > "> Z  ≥ </option>
          <option value=" Z  < "> Z  ≤ </option>
        </select>
        <input type="number" value={quantile} onChange={handleQuantileChange} onBlur={handleQuantileBlur}
          min={type.includes("|Z|") ? 0 : -4} max={4} step="0.01"
          title={`Enter a quantile value (${type.includes("|Z|") ? '0 to 4' : '-4 to 4'}).`}
          className="w-20 mx-1 p-1 border border-gray-300 rounded bg-blue-100 text-lg"
        />
        ) =
        <input type="number" value={probability} onChange={handleProbabilityChange} onBlur={handleProbabilityBlur}
          min="0.001" max="0.999" step="0.001" title="Enter a probability value (0.001 to 0.999)."
          className="w-24 mx-1 p-1 border border-gray-300 rounded bg-red-100 text-lg"
        />
      </div>
      <canvas ref={canvasRef} width="800" height="300" className="border border-gray-300" />
      <hr className="mt-5" />
      <p className="text-right italic">by Dr. B.Walter and Claude.ai</p>
    </div>
  );
};

export default NormalProbabilityCalculator;
