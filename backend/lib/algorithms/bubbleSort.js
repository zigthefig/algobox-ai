// Bubble Sort Step Generator

function generateBubbleSortSteps(arr) {
  const steps = [];
  const array = [...arr];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        index: steps.length,
        type: 'compare',
        state: {
          array: [...array],
          i,
          j,
          comparing: [j, j + 1],
          swapped: false,
        },
        description: `Comparing ${array[j]} and ${array[j + 1]}`,
      });

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        steps.push({
          index: steps.length,
          type: 'swap',
          state: {
            array: [...array],
            i,
            j,
            comparing: [j, j + 1],
            swapped: true,
          },
          description: `Swapped ${array[j]} and ${array[j + 1]}`,
        });
      }
    }
  }

  steps.push({
    index: steps.length,
    type: 'complete',
    state: {
      array: [...array],
      sorted: true,
    },
    description: 'Array is sorted',
  });

  return steps;
}

module.exports = { generateBubbleSortSteps };