import type { StatsFunction } from './types.js';

import { tBoolean } from '../logical/index.js';

export const checkboxTypeStatsFunctions: StatsFunction[] = [
  {
    group: 'Contar',
    type: 'count-values',
    dataType: tBoolean.create(),
  },
  {
    group: 'Contar',
    type: 'count-unique-values',
    dataType: tBoolean.create(),
  },
  {
    group: 'Contar',
    type: 'count-empty',
    dataType: tBoolean.create(),
    menuName: 'Contar sin marcar',
    displayName: 'Sin marcar',
    impl: data => {
      const emptyList = data.filter(value => !value);
      return emptyList.length.toString();
    },
  },
  {
    group: 'Contar',
    type: 'count-not-empty',
    dataType: tBoolean.create(),
    menuName: 'Contar marcado',
    displayName: 'Marcado',
    impl: (data: unknown[]) => {
      const notEmptyList = data.filter(value => !!value);
      return notEmptyList.length.toString();
    },
  },
  {
    group: 'Porcentaje',
    type: 'percent-empty',
    dataType: tBoolean.create(),
    menuName: 'Porcentaje sin marcar',
    displayName: 'Sin marcar',
    impl: (data: unknown[]) => {
      if (data.length === 0) return '';
      const emptyList = data.filter(value => !value);
      return ((emptyList.length / data.length) * 100).toFixed(2) + '%';
    },
  },
  {
    group: 'Porcentaje',
    type: 'percent-not-empty',
    dataType: tBoolean.create(),
    menuName: 'Porcentaje marcado',
    displayName: 'Marcado',
    impl: (data: unknown[]) => {
      if (data.length === 0) return '';
      const notEmptyList = data.filter(value => !!value);
      return ((notEmptyList.length / data.length) * 100).toFixed(2) + '%';
    },
  },
];
