import { t } from '../../logical/type-presets.js';
import { createFilter } from './create.js';

export const booleanFilter = [
  createFilter({
    name: 'isChecked',
    self: t.boolean.instance(),
    args: [],
    label: 'Está marcado',
    shortString: () => ': Marcado',
    impl: value => {
      return !!value;
    },
  }),
  createFilter({
    name: 'isUnchecked',
    self: t.boolean.instance(),
    args: [],
    label: 'No está marcado',
    shortString: () => ': Sin marcar',
    impl: value => {
      return !value;
    },
  }),
];
