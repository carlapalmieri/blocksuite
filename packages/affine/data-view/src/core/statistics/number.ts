import type { StatsFunction } from './types.js';

import { tNumber } from '../logical/data-type.js';

export const numberStatsFunctions: StatsFunction[] = [
  {
    group: 'Más opciones',
    menuName: 'Suma',
    type: 'sum',
    dataType: tNumber.create(),
    impl: (data: number[]) => {
      const numbers = withoutNull(data);
      if (numbers.length === 0) {
        return 'Ninguno';
      }
      return numbers.reduce((a, b) => a + b, 0).toString();
    },
  },
  {
    group: 'Más opciones',
    menuName: 'Promedio',
    type: 'average',
    dataType: tNumber.create(),
    impl: (data: number[]) => {
      const numbers = withoutNull(data);
      if (numbers.length === 0) {
        return 'Ninguno';
      }
      return (numbers.reduce((a, b) => a + b, 0) / numbers.length).toString();
    },
  },
  {
    group: 'Más opciones',
    menuName: 'Mediana',
    type: 'median',
    dataType: tNumber.create(),
    impl: (data: number[]) => {
      const arr = withoutNull(data).sort((a, b) => a - b);
      let result = 0;
      if (arr.length % 2 === 1) {
        result = arr[(arr.length - 1) / 2];
      } else {
        const index = arr.length / 2;
        result = (arr[index] + arr[index - 1]) / 2;
      }
      return result?.toString() ?? 'Ninguno';
    },
  },
  {
    group: 'Más opciones',
    menuName: 'Mínimo',
    type: 'min',
    dataType: tNumber.create(),
    impl: (data: number[]) => {
      let min: number | null = null;
      for (const num of data) {
        if (num != null) {
          if (min == null) {
            min = num;
          } else {
            min = Math.min(min, num);
          }
        }
      }
      return min?.toString() ?? 'Ninguno';
    },
  },
  {
    group: 'Más opciones',
    menuName: 'Máximo',
    type: 'max',
    dataType: tNumber.create(),
    impl: (data: number[]) => {
      let max: number | null = null;
      for (const num of data) {
        if (num != null) {
          if (max == null) {
            max = num;
          } else {
            max = Math.max(max, num);
          }
        }
      }
      return max?.toString() ?? 'Ninguno';
    },
  },
  {
    group: 'Más opciones',
    menuName: 'Rango',
    type: 'range',
    dataType: tNumber.create(),
    impl: (data: number[]) => {
      let min: number | null = null;
      let max: number | null = null;
      for (const num of data) {
        if (num != null) {
          if (max == null) {
            max = num;
          } else {
            max = Math.max(max, num);
          }
          if (min == null) {
            min = num;
          } else {
            min = Math.min(min, num);
          }
        }
      }
      if (min == null || max == null) {
        return 'Ninguno';
      }
      return (max - min).toString();
    },
  },
];
const withoutNull = (arr: number[]) => arr.filter(v => v != null);
