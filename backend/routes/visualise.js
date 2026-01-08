const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Import step generators
const { generateQuickSortSteps } = require('../lib/algorithms/quickSort');
const { generateBubbleSortSteps } = require('../lib/algorithms/bubbleSort');
const { generateMergeSortSteps } = require('../lib/algorithms/mergeSort');
const { generateAStarSteps } = require('../lib/algorithms/aStar');
const { generateDijkstraSteps } = require('../lib/algorithms/dijkstra');
const { generateBinarySearchSteps } = require('../lib/algorithms/binarySearch');

// POST /api/visualise/run
router.post('/run', async (req, res) => {
  try {
    const { algorithm, input } = req.body;

    // Validate input
    if (!algorithm || !input) {
      return res.status(400).json({ error: 'Algorithm and input are required' });
    }

    // Generate hash for caching
    const inputHash = crypto.createHash('md5').update(JSON.stringify({ algorithm, input })).digest('hex');

    // Check cache
    const cached = await req.cache.get(`algo:${inputHash}`);
    if (cached) {
      const run = JSON.parse(cached);
      return res.json(run);
    }

    // Generate steps based on algorithm
    let steps;
    switch (algorithm) {
      case 'quick-sort':
        steps = generateQuickSortSteps(input.array);
        break;
      case 'bubble-sort':
        steps = generateBubbleSortSteps(input.array);
        break;
      case 'merge-sort':
        steps = generateMergeSortSteps(input.array);
        break;
      case 'binary-search':
        steps = generateBinarySearchSteps(input.array, input.target);
        break;
      case 'a-star':
        steps = generateAStarSteps(input.grid, input.start, input.end);
        break;
      case 'dijkstra':
        steps = generateDijkstraSteps(input.graph, input.start);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported algorithm' });
    }

    // Create run record
    const run = await req.prisma.algoRun.create({
      data: {
        algorithmId: algorithm,
        steps: JSON.stringify(steps),
        completed: true,
        // userId: req.body.userId || 'anonymous', // TODO: get from auth
      },
    });

    // Cache the result
    await req.cache.set(`algo:${inputHash}`, JSON.stringify(run)); // No TTL for in-memory

    res.json(run);
  } catch (error) {
    console.error('Error running algorithm:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/visualise/run/:id
router.get('/run/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const run = await req.prisma.algoRun.findUnique({
      where: { id },
    });

    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }

    res.json({
      ...run,
      steps: JSON.parse(run.steps),
    });
  } catch (error) {
    console.error('Error fetching run:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/visualise/explain-step
router.post('/explain-step', async (req, res) => {
  try {
    const { algorithm, stepIndex, state, codeLines } = req.body;

    // TODO: Integrate with AI service for explanations
    // For now, return mock explanation
    const explanation = `Step ${stepIndex + 1}: ${getMockExplanation(algorithm, stepIndex, state)}`;

    res.json({ explanation });
  } catch (error) {
    console.error('Error explaining step:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function getMockExplanation(algorithm, stepIndex, state) {
  // Mock explanations - replace with AI
  if (algorithm === 'quick-sort') {
    return `Partitioning around pivot ${state.pivot}. Left: ${state.left}, Right: ${state.right}`;
  }
  if (algorithm === 'a-star') {
    return `Exploring node at ${state.current}. f=${state.f}, g=${state.g}, h=${state.h}`;
  }
  return 'Processing current step...';
}

module.exports = router;