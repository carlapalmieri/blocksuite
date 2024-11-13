import type { StatisticsConfig } from './types.js';

import { t } from '../logical/index.js';
import { createStatisticConfig } from './create.js';

export const checkboxTypeStatsFunctions: StatisticsConfig[] = [
  createStatisticConfig({
    group: 'Contar',
    type: 'count-values',
    dataType: t.boolean.instance(),
  }),
  createStatisticConfig({
    group: 'Contar',
    type: 'count-unique-values',
    dataType: t.boolean.instance(),
  }),
  createStatisticConfig({
    group: 'Contar',
    type: 'count-empty',
    dataType: t.boolean.instance(),
    menuName: 'Sin marcar',
    displayName: 'Sin marcar',
    impl: data => {
      const emptyList = data.filter(value => !value);
      return emptyList.length.toString();
    },
  }),
  createStatisticConfig({
    group: 'Contar',
    type: 'count-not-empty',
    dataType: t.boolean.instance(),
    menuName: 'Count Checked',
    displayName: 'Marcado',
    impl: data => {
      const notEmptyList = data.filter(value => !!value);
      return notEmptyList.length.toString();
    },
  }),
  createStatisticConfig({
    group: 'Porcentaje',
    type: 'percent-empty',
    dataType: t.boolean.instance(),
    menuName: 'Porcentaje sin marcar',
    displayName: 'Sin marcar',
    impl: data => {
      if (data.length === 0) return '';
      const emptyList = data.filter(value => !value);
      return ((emptyList.length / data.length) * 100).toFixed(2) + '%';
    },
  }),
  createStatisticConfig({
    group: 'Porcentaje',
    type: 'percent-not-empty',
    dataType: t.boolean.instance(),
    menuName: 'Porcentaje marcado',
    displayName: 'Marcado',
    impl: data => {
      if (data.length === 0) return '';
      const notEmptyList = data.filter(value => !!value);
      return ((notEmptyList.length / data.length) * 100).toFixed(2) + '%';
    },
  }),
];
