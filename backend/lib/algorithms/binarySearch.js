// Binary Search Step Generator

function generateBinarySearchSteps(arr, target) {
  const steps = [];
  const array = [...arr].sort((a, b) => a - b); // Ensure sorted
  let left = 0;
  let right = array.length - 1;

  steps.push({
    index: steps.length,
    type: 'init',
    state: {
      array: [...array],
      left,
      right,
      target,
      found: false,
    },
    description: `Starting binary search for ${target} in sorted array`,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    steps.push({
      index: steps.length,
      type: 'mid_calc',
      state: {
        array: [...array],
        left,
        right,
        mid,
        target,
        current: array[mid],
      },
      description: `Calculated mid index ${mid}, value ${array[mid]}`,
    });

    if (array[mid] === target) {
      steps.push({
        index: steps.length,
        type: 'found',
        state: {
          array: [...array],
          left,
          right,
          mid,
          target,
          found: true,
        },
        description: `Found ${target} at index ${mid}`,
      });
      break;
    } else if (array[mid] < target) {
      left = mid + 1;
      steps.push({
        index: steps.length,
        type: 'search_right',
        state: {
          array: [...array],
          left,
          right,
          mid,
          target,
        },
        description: `${array[mid]} < ${target}, searching right half`,
      });
    } else {
      right = mid - 1;
      steps.push({
        index: steps.length,
        type: 'search_left',
        state: {
          array: [...array],
          left,
          right,
          mid,
          target,
        },
        description: `${array[mid]} > ${target}, searching left half`,
      });
    }
  }

  if (left > right) {
    steps.push({
      index: steps.length,
      type: 'not_found',
      state: {
        array: [...array],
        left,
        right,
        target,
        found: false,
      },
      description: `${target} not found in array`,
    });
  }

  return steps;
}

module.exports = { generateBinarySearchSteps };