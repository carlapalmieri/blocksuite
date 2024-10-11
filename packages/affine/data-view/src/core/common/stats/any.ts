import type { StatsFunction } from './type.js';

import { tUnknown } from '../../logical/typesystem.js';

export const anyTypeStatsFunctions: StatsFunction[] = [
  {
    group: 'Contar',
    menuName: 'Contar todos',
    displayName: 'Todos',
    type: 'count-all',
    dataType: tUnknown.create(),
    impl: (data: unknown[]) => {
      return data.length.toString();
    },
  },
  {
    group: 'Contar',
    menuName: 'Contar valores',
    displayName: 'Valores',
    type: 'count-values',
    dataType: tUnknown.create(),
    impl: (data: unknown[], { meta }) => {
      const values = data
        .flatMap(v => {
          if (meta.config.values) {
            return meta.config.values(v);
          }
          return v;
        })
        .filter(v => v != null);
      return values.length.toString();
    },
  },
  {
    group: 'Contar',
    menuName: 'Contar valores únicos',
    displayName: 'Valores únicos',
    type: 'count-unique-values',
    dataType: tUnknown.create(),
    impl: (data: unknown[], { meta }) => {
      const values = data
        .flatMap(v => {
          if (meta.config.values) {
            return meta.config.values(v);
          }
          return v;
        })
        .filter(v => v != null);
      return new Set(values).size.toString();
    },
  },
  {
    group: 'Contar',
    menuName: 'Contar vacíos',
    displayName: 'Vacíos',
    type: 'count-empty',
    dataType: tUnknown.create(),
    impl: (data, { meta }) => {
      const emptyList = data.filter(value => meta.config.isEmpty(value));
      return emptyList.length.toString();
    },
  },
  {
    group: 'Contar',
    menuName: 'Contar no vacíos',
    displayName: 'No vacíos',
    type: 'count-not-empty',
    dataType: tUnknown.create(),
    impl: (data: unknown[], { meta }) => {
      const notEmptyList = data.filter(value => !meta.config.isEmpty(value));
      return notEmptyList.length.toString();
    },
  },
  {
    group: 'Porcentaje',
    menuName: 'Porcentaje vacíos',
    displayName: 'Vacíos',
    type: 'percent-empty',
    dataType: tUnknown.create(),
    impl: (data: unknown[], { meta }) => {
      if (data.length === 0) return '';
      const emptyList = data.filter(value => meta.config.isEmpty(value));
      return ((emptyList.length / data.length) * 100).toFixed(2) + '%';
    },
  },
  {
    group: 'Porcentaje',
    menuName: 'Porcentaje no vacíos',
    displayName: 'No vacíos',
    type: 'percent-not-empty',
    dataType: tUnknown.create(),
    impl: (data: unknown[], { meta }) => {
      if (data.length === 0) return '';
      const notEmptyList = data.filter(value => !meta.config.isEmpty(value));
      return ((notEmptyList.length / data.length) * 100).toFixed(2) + '%';
    },
  },
];
