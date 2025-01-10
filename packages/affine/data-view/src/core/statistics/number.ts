import type { StatisticsConfig } from './types.js';

import { t } from '../logical/index.js';
import { createStatisticConfig } from './create.js';

export const numberStatsFunctions: StatisticsConfig[] = [
  createStatisticConfig({
    group: 'Más opciones',
    menuName: 'Suma',
    type: 'sum',
    displayName: 'Sum',
    dataType: t.number.instance(),
    impl: data => {
      const numbers = withoutNull(data);
      if (numbers.length === 0) {
        return 'Ninguno';
      }
      return parseFloat(
        numbers.reduce((a, b) => a + b, 0).toFixed(2)
      ).toString();
    },
  }),
  createStatisticConfig({
    group: 'Más opciones',
    menuName: 'Promedio',
    displayName: 'Promedio',
    type: 'average',
    dataType: t.number.instance(),
    impl: data => {
      const numbers = withoutNull(data);
      if (numbers.length === 0) {
        return 'Ninguno';
      }
      return (numbers.reduce((a, b) => a + b, 0) / numbers.length).toString();
    },
  }),
  createStatisticConfig({
    group: 'Más opciones',
    menuName: 'Mediana',
    displayName: 'Mediana',
    type: 'median',
    dataType: t.number.instance(),
    impl: data => {
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
  }),
  createStatisticConfig({
    group: 'Más opciones',
    menuName: 'Mínimo',
    displayName: 'Mínimo',
    type: 'min',
    dataType: t.number.instance(),
    impl: data => {
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
  }),
  createStatisticConfig({
    group: 'Más opciones',
    menuName: 'Máximo',
    displayName: 'Máximo',
    type: 'max',
    dataType: t.number.instance(),
    impl: data => {
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
  }),
  createStatisticConfig({
    group: 'Más opciones',
    menuName: 'Rango',
    displayName: 'Rango',
    type: 'range',
    dataType: t.number.instance(),
    impl: data => {
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
  }),
];
const withoutNull = (arr: readonly (number | null | undefined)[]): number[] =>
  arr.filter(v => v != null);
