import type { FilterDefineType } from './matcher.js';

import { tBoolean } from '../../logical/data-type.js';
import { tFunction } from '../../logical/typesystem.js';

export const booleanFilter = {
  isChecked: {
    type: tFunction({ args: [tBoolean.create()], rt: tBoolean.create() }),
    label: 'Está marcado',
    impl: value => {
      return !!value;
    },
  },
  isUnchecked: {
    type: tFunction({ args: [tBoolean.create()], rt: tBoolean.create() }),
    label: 'No está marcado',
    impl: value => {
      return !value;
    },
  },
} satisfies Record<string, FilterDefineType>;
