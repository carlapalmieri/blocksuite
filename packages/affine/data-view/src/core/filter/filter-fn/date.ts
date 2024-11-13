import { format } from 'date-fns/format';

import { t } from '../../logical/type-presets.js';
import { createFilter } from './create.js';

export const dateFilter = [
  createFilter({
    name: 'before',
    self: t.date.instance(),
    args: [t.date.instance()] as const,
    label: 'Antes de',
    shortString: v => (v ? ` < ${format(v.value, 'dd/MM/yyyy')}` : undefined),
    impl: (self, value) => {
      if (self == null) {
        return false;
      }
      return self < value;
    },
  }),
  createFilter({
    name: 'after',
    self: t.date.instance(),
    args: [t.date.instance()] as const,
    label: 'Despues de',
    shortString: v => (v ? ` > ${format(v.value, 'dd/MM/yyyy')}` : undefined),
    impl: (self, value) => {
      if (self == null) {
        return false;
      }
      return self > value;
    },
  }),
];
