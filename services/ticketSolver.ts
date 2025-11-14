
// Pre-computation of permutations and partitions to speed up solving.

type Permutation = number[];

const generatePermutations = <T,>(input: T[]): T[][] => {
  if (input.length === 0) return [[]];
  const firstEl = input[0];
  const rest = input.slice(1);

  const permsWithoutFirst = generatePermutations(rest);
  const allPermutations: T[][] = [];

  permsWithoutFirst.forEach((perm) => {
    for (let i = 0; i <= perm.length; i++) {
      const permWithFirst = [...perm.slice(0, i), firstEl, ...perm.slice(i)];
      allPermutations.push(permWithFirst);
    }
  });

  return allPermutations;
};


const KOMB_ALL: Permutation[][] = [
  [], // 0 operators
  [[1]], // 1 operator, 1 permutation
];
for (let i = 2; i <= 5; i++) {
  const elements = Array.from({ length: i }, (_, k) => k + 1);
  KOMB_ALL.push(generatePermutations(elements));
}

const generatePartitions = (): number[][] => {
  const lenStrAll: number[][] = [];
  // This logic is a direct translation from the original Python script's
  // nested loops to generate the 32 valid ways to partition a 6-digit number.
  for (let l6 = 0; l6 < 2; l6++) {
    for (let l5 = 0; l5 < 3; l5++) {
      for (let l4 = 0; l4 < 4; l4++) {
        for (let l3 = 0; l3 < 5; l3++) {
          for (let l2 = 0; l2 < 6; l2++) {
            for (let l1 = 1; l1 < 7; l1++) {
              if (l1 + l2 + l3 + l4 + l5 + l6 === 6) {
                const lenStr = [0, l1, l2, l3, l4, l5, l6];
                let fixLenZero = true;
                for (let i = 2; i <= 5; i++) {
                  if (lenStr[i] === 0 && lenStr[i + 1] > 0) {
                    fixLenZero = false;
                    break;
                  }
                }
                if (fixLenZero) {
                  lenStrAll.push(lenStr);
                }
              }
            }
          }
        }
      }
    }
  }
  return lenStrAll;
};

const LEN_STR_ALL = generatePartitions();

const formatSolution = (
  initialNums: number[],
  firstSign: number,
  signs: number[],
  perm: Permutation
): string => {
  const operatorMap: { [key: number]: string } = {
    1: '+', 2: '-', 3: '*', 4: '/', 5: '* -', 6: '/ -'
  };

  let str = '';
  let firstNumVal = initialNums[1];
  if (firstSign === 2) {
    firstNumVal = -firstNumVal;
  }
  str += `${firstNumVal} `;

  for (let i = 0; i < signs.length; i++) {
    const opPriority = perm[i];
    const opSymbol = operatorMap[signs[i+1]];
    const nextNum = initialNums[i + 2];
    str += `(${opPriority}) ${opSymbol} ${nextNum} `;
  }
  return str.trim() + ' = 100';
};

export const findSolution = (ticketNumber: string): string | null => {
  if (ticketNumber.length !== 6 || !/^\d{6}$/.test(ticketNumber)) {
    return null;
  }
  
  for (const lenStr of LEN_STR_ALL) {
    let currentPos = 0;
    const initialNums: number[] = [0];
    let countMathOper = 0;
    for (let i = 1; i <= 6; i++) {
      const len = lenStr[i];
      if (len > 0) {
        countMathOper++;
        const num = parseInt(ticketNumber.substring(currentPos, currentPos + len), 10);
        initialNums.push(num);
        currentPos += len;
      } else {
        break;
      }
    }

    if (countMathOper === 0) continue;

    const maxOps = countMathOper - 1;
    if (maxOps < 0) {
      if(initialNums.length > 1 && initialNums[1] === 100) return "100 = 100";
      continue;
    }
    
    for (let firstSign = 1; firstSign <= 2; firstSign++) {
      const nums = [...initialNums];
      nums[1] = firstSign === 1 ? nums[1] : -nums[1];
      
      const permutations = KOMB_ALL[maxOps];
      if (!permutations) continue;

      const operatorCombinations = Math.pow(6, maxOps);

      for(let i = 0; i < operatorCombinations; i++) {
        let temp = i;
        const signs: number[] = [0]; // 1-based index
        for(let j = 0; j < maxOps; j++) {
            signs.push((temp % 6) + 1);
            temp = Math.floor(temp / 6);
        }

        for (const perm of permutations) {
            let calcNumber = [...nums];
            let calcSign = [...signs];
            let calcOrder = [...perm];
            let exzero = false;

            for (let iMathOper = 1; iMathOper <= maxOps; iMathOper++) {
                const opPriorityToFind = iMathOper;
                const opIndexInOrderArr = calcOrder.indexOf(opPriorityToFind);
                
                if (opIndexInOrderArr === -1) { exzero = true; break; }

                const opPosition = opIndexInOrderArr + 1;
                const rightNum = calcNumber[opPosition + 1];
                const operatorCode = calcSign[opPosition];

                if (rightNum === 0 && (operatorCode === 4 || operatorCode === 6)) {
                    exzero = true;
                    break;
                }

                let result = 0;
                const leftNum = calcNumber[opPosition];
                switch (operatorCode) {
                    case 1: result = leftNum + rightNum; break;
                    case 2: result = leftNum - rightNum; break;
                    case 3: result = leftNum * rightNum; break;
                    case 4: result = leftNum / rightNum; break;
                    case 5: result = leftNum * -rightNum; break;
                    case 6: result = leftNum / -rightNum; break;
                    default: exzero = true; break;
                }
                if (exzero) break;

                calcNumber[opPosition] = result;
                calcNumber.splice(opPosition + 1, 1);
                calcSign.splice(opPosition, 1);
                calcOrder.splice(opIndexInOrderArr, 1);
            }

            if (exzero) continue;
            
            if (calcNumber.length === 2 && Math.abs(calcNumber[1] - 100) < 1e-9) {
                return formatSolution(initialNums, firstSign, signs, perm);
            }
        }
      }
    }
  }

  return null;
};
