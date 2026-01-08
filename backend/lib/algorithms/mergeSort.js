// Merge Sort Step Generator

function generateMergeSortSteps(arr) {
  const steps = [];
  const array = [...arr];

  function mergeSort(start, end) {
    if (start < end) {
      const mid = Math.floor((start + end) / 2);
      mergeSort(start, mid);
      mergeSort(mid + 1, end);
      merge(start, mid, end);
    }
  }

  function merge(start, mid, end) {
    const left = array.slice(start, mid + 1);
    const right = array.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;

    steps.push({
      index: steps.length,
      type: 'merge_start',
      state: {
        array: [...array],
        start,
        mid,
        end,
        left,
        right,
      },
      description: `Merging subarrays [${start}..${mid}] and [${mid + 1}..${end}]`,
    });

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        array[k] = left[i];
        i++;
      } else {
        array[k] = right[j];
        j++;
      }
      k++;
    }

    while (i < left.length) {
      array[k] = left[i];
      i++;
      k++;
    }

    while (j < right.length) {
      array[k] = right[j];
      j++;
      k++;
    }

    steps.push({
      index: steps.length,
      type: 'merge_complete',
      state: {
        array: [...array],
        start,
        mid,
        end,
      },
      description: `Merged subarrays`,
    });
  }

  mergeSort(0, array.length - 1);

  return steps;
}

module.exports = { generateMergeSortSteps };