// Dijkstra's Algorithm Step Generator

function generateDijkstraSteps(graph, start) {
  const steps = [];
  const distances = {};
  const visited = new Set();
  const previous = {};
  const nodes = Object.keys(graph);

  nodes.forEach(node => {
    distances[node] = node === start ? 0 : Infinity;
    previous[node] = null;
  });

  steps.push({
    index: steps.length,
    type: 'init',
    state: {
      distances: { ...distances },
      visited: [...visited],
      current: start,
    },
    description: `Initialized distances with start node ${start}`,
  });

  while (visited.size < nodes.length) {
    // Find unvisited node with smallest distance
    let minDistance = Infinity;
    let current = null;
    for (const node of nodes) {
      if (!visited.has(node) && distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    if (current === null || distances[current] === Infinity) break;

    visited.add(current);

    steps.push({
      index: steps.length,
      type: 'visit',
      state: {
        distances: { ...distances },
        visited: [...visited],
        current,
        previous: { ...previous },
      },
      description: `Visiting node ${current} with distance ${distances[current]}`,
    });

    // Update neighbors
    for (const neighbor in graph[current]) {
      const weight = graph[current][neighbor];
      const alt = distances[current] + weight;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = current;

        steps.push({
          index: steps.length,
          type: 'update',
          state: {
            distances: { ...distances },
            visited: [...visited],
            current,
            neighbor,
            previous: { ...previous },
          },
          description: `Updated distance to ${neighbor} to ${alt}`,
        });
      }
    }
  }

  return steps;
}

module.exports = { generateDijkstraSteps };