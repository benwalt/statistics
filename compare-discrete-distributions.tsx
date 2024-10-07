import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const distributions = [
  { name: 'Bernoulli', params: ['p'] },
  { name: 'Binomial', params: ['p', 'n'] },
  { name: 'Uniform', params: ['n'] },
  { name: 'Geometric', params: ['p'] },
  { name: 'Negative Binomial', params: ['p', 'k'] },
  { name: 'Poisson', params: ['r', 't'] },
  { name: 'HyperGeometric', params: ['N', 'M', 'k'] }
];

const initialParams = {
  p: 0.5,
  n: 1,
  k: 1,
  r: 1,
  t: 1,
  N: 1,
  M: 1
};

const DiscreteDistributionWidget = () => {
  const [distribution, setDistribution] = useState(distributions[0].name);
  const [params, setParams] = useState(initialParams);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);

  const handleParamChange = (param, value) => {
    let newValue = value;
    if (param === 'p') {
      newValue = Math.max(0.01, Math.min(0.99, parseFloat(value)));
    } else if (param === 'r') {
      newValue = Math.max(0.01, Math.min(10, parseFloat(value)));
    } else {
      newValue = Math.max(1, parseInt(value));
    }
    setParams({ ...params, [param]: newValue });
  };

  const calculateProbabilities = () => {
    let newData = [];
    let xMax = 200;
    let yMax = 0;

    switch (distribution) {
      case 'Bernoulli':
        newData = [
          { x: 0, y: 1 - params.p },
          { x: 1, y: params.p }
        ];
        break;
      case 'Binomial':
        for (let x = 0; x <= params.n; x++) {
          const p = binomialProbability(params.n, x, params.p);
          newData.push({ x, y: p });
          yMax = Math.max(yMax, p);
        }
        break;
      case 'Uniform':
        const uniformProb = 1 / params.n;
        for (let x = 1; x <= params.n; x++) {
          newData.push({ x, y: uniformProb });
        }
        yMax = Math.max(0.1, uniformProb);
        break;
      case 'Geometric':
        const mean = 1 / params.p;
        const stdDev = Math.sqrt((1 - params.p) / (params.p ** 2));
        xMax = Math.min(200, Math.ceil(mean + 2 * stdDev));
        for (let x = 1; x <= xMax; x++) {
          const p = geometricProbability(x, params.p);
          newData.push({ x, y: p });
          yMax = Math.max(yMax, p);
        }
        break;
      case 'Negative Binomial':
        const nbMean = params.k / params.p;
        const nbStdDev = Math.sqrt(params.k * (1 - params.p) / (params.p ** 2));
        xMax = Math.min(200, Math.ceil(nbMean + 2 * nbStdDev));
        for (let x = params.k; x <= xMax; x++) {
          const p = negativeBinomialProbability(x, params.k, params.p);
          newData.push({ x, y: p });
          yMax = Math.max(yMax, p);
        }
        break;
      case 'Poisson':
        const poissonMean = params.r * params.t;
        const poissonStdDev = Math.sqrt(poissonMean);
        xMax = Math.min(200, Math.ceil(poissonMean + 2 * poissonStdDev));
        for (let x = 0; x <= xMax; x++) {
          const p = poissonProbability(x, poissonMean);
          newData.push({ x, y: p });
          yMax = Math.max(yMax, p);
        }
        break;
      case 'HyperGeometric':
        const totalPopulation = params.N + params.M;
        xMax = Math.min(params.k, params.N);
        for (let x = Math.max(0, params.k - params.M); x <= xMax; x++) {
          const p = hyperGeometricProbability(x, params.N, params.M, params.k);
          newData.push({ x, y: p });
          yMax = Math.max(yMax, p);
        }
        break;
    }

    setData(newData);
  };

  useEffect(() => {
    calculateProbabilities();
  }, [distribution, params]);

  const binomialProbability = (n, k, p) => {
    const coefficient = factorial(n) / (factorial(k) * factorial(n - k));
    return coefficient * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };

  const geometricProbability = (x, p) => {
    return p * Math.pow(1 - p, x - 1);
  };

  const negativeBinomialProbability = (x, k, p) => {
    const coefficient = factorial(x - 1) / (factorial(k - 1) * factorial(x - k));
    return coefficient * Math.pow(p, k) * Math.pow(1 - p, x - k);
  };

  const poissonProbability = (x, lambda) => {
    return (Math.pow(lambda, x) * Math.exp(-lambda)) / factorial(x);
  };

  const hyperGeometricProbability = (x, N, M, n) => {
    const numerator = combination(N, x) * combination(M, n - x);
    const denominator = combination(N + M, n);
    return numerator / denominator;
  };

  const factorial = (n) => {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const combination = (n, k) => {
    return factorial(n) / (factorial(k) * factorial(n - k));
  };

  const getDescription = () => {
    switch (distribution) {
      case 'Bernoulli':
        return "The Bernoulli distribution models a single trial with two possible outcomes (success or failure). p is the probability of success.";
      case 'Binomial':
        return "The Binomial distribution models the number of successes in n independent Bernoulli trials. p is the probability of success for each trial.";
      case 'Uniform':
        return "The Uniform distribution models a situation where all outcomes are equally likely. n is the number of possible outcomes.";
      case 'Geometric':
        return "The Geometric distribution models the number of trials needed to get the first success. p is the probability of success on each trial.";
      case 'Negative Binomial':
        return "The Negative Binomial distribution models the number of failures before k successes occur. p is the probability of success on each trial.";
      case 'Poisson':
        return "The Poisson distribution models the number of events occurring in a fixed interval. r is the average rate of occurrence, and t is the time span.";
      case 'HyperGeometric':
        return "The Hypergeometric distribution models drawing k items from a population of N+M items, where N items are considered successes. N is the number of successes, M is the number of failures, and k is the number of draws.";
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6">Discrete Distribution Exploration</h1>
      
      <div className="mb-4">
        <Select value={distribution} onValueChange={setDistribution}>
          <SelectTrigger>
            <SelectValue placeholder="Select a distribution" />
          </SelectTrigger>
          <SelectContent>
            {distributions.map((dist) => (
              <SelectItem key={dist.name} value={dist.name}>
                {dist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {distributions.find(d => d.name === distribution).params.map((param) => (
          <div key={param} className="flex items-center">
            <span className="font-bold mr-2">{param}:</span>
            <Input
              type="number"
              value={params[param]}
              onChange={(e) => handleParamChange(param, e.target.value)}
              step={param === 'p' ? 0.01 : param === 'r' ? 0.1 : 1}
              min={['p', 'r'].includes(param) ? 0.01 : 1}
              max={param === 'p' ? 0.99 : param === 'r' ? 10 : undefined}
              className="w-20"
            />
          </div>
        ))}
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="y" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <p className="mb-4">{getDescription()}</p>
      
      <hr className="my-4" />
      <p className="text-right italic">by Dr. B. Walter and Claude.ai</p>
    </div>
  );
};

export default DiscreteDistributionWidget;
