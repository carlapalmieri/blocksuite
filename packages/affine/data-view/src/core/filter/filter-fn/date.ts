import { addDays } from 'date-fns/addDays';
import { format } from 'date-fns/format';
import { subDays } from 'date-fns/subDays';

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
    defaultValue: args => subDays(args[0], 1).getTime(),
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
    defaultValue: args => addDays(args[0], 1).getTime(),
  }),
];
