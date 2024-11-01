import type { FilterDefineType } from './matcher.js';

import { tBoolean, tDate } from '../../logical/data-type.js';
import { tFunction } from '../../logical/typesystem.js';

export const dateFilter = {
  before: {
    type: tFunction({
      args: [tDate.create(), tDate.create()],
      rt: tBoolean.create(),
    }),
    label: 'Antes de',
    impl: (value, target) => {
      if (typeof value !== 'number' || typeof target !== 'number') {
        return true;
      }
      return value < target;
    },
  },
  after: {
    type: tFunction({
      args: [tDate.create(), tDate.create()],
      rt: tBoolean.create(),
    }),
    label: 'Después de',
    impl: (value, target) => {
      if (typeof value !== 'number' || typeof target !== 'number') {
        return true;
      }
      return value > target;
    },
  },
} as Record<string, FilterDefineType>;
