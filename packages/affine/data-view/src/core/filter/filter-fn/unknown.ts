import { t } from '../../logical/type-presets.js';
import { createFilter } from './create.js';

export const unknownFilter = [
  createFilter({
    name: 'isNotEmpty',
    self: t.unknown.instance(),
    args: [] as const,
    label: 'No está vacío',
    shortString: () => ': No está vacío',
    impl: self => {
      if (Array.isArray(self)) {
        return self.length > 0;
      }
      if (typeof self === 'string') {
        return !!self;
      }
      return self != null;
    },
  }),
  createFilter({
    name: 'isEmpty',
    self: t.unknown.instance(),
    args: [] as const,
    label: 'Está vacío',
    shortString: () => ': Está vacío',
    impl: self => {
      if (Array.isArray(self)) {
        return self.length === 0;
      }
      if (typeof self === 'string') {
        return !self;
      }
      return self == null;
    },
  }),
];
