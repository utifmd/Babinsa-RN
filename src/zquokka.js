let data = [0, 3, 4, 6, 9, 0, 0, 0, 0, 0, 6, 6, 8],
rsl = data.filter((x, i) => data.indexOf(x) == i)//.sort((a, b) => a - b)

rsl

// function countDuplicates(original) {
//     const uniqueItems = new Set();
//     const duplicates = new Set();
//     for (const value of original) {
//       if (uniqueItems.has(value)) {
//         duplicates.add(value);
//         uniqueItems.delete(value);
//       } else {
//         uniqueItems.add(value);
//       }
//     }
//     return duplicates.size;
//   }
  

//   let mu = countDuplicates(data)

//   mu