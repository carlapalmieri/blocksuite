import type { FilterDefineType } from './matcher.js';

import { tBoolean, tString } from '../../../core/logical/data-type.js';
import { tFunction } from '../../../core/logical/typesystem.js';

export const stringFilter = {
  is: {
    type: tFunction({
      args: [tString.create(), tString.create()],
      rt: tBoolean.create(),
    }),
    label: 'Es',
    impl: (value, target) => {
      if (
        typeof value !== 'string' ||
        typeof target !== 'string' ||
        target === ''
      ) {
        return true;
      }
      return value == target;
    },
  },
  isNot: {
    type: tFunction({
      args: [tString.create(), tString.create()],
      rt: tBoolean.create(),
    }),
    label: 'No es',
    impl: (value, target) => {
      if (
        typeof value !== 'string' ||
        typeof target !== 'string' ||
        target === ''
      ) {
        return true;
      }
      return value != target;
    },
  },
  contains: {
    type: tFunction({
      args: [tString.create(), tString.create()],
      rt: tBoolean.create(),
    }),
    label: 'Contiene',
    impl: (value, target) => {
      if (
        typeof value !== 'string' ||
        typeof target !== 'string' ||
        target === ''
      ) {
        return true;
      }
      return value.includes(target);
    },
  },
  doesNoContains: {
    type: tFunction({
      args: [tString.create(), tString.create()],
      rt: tBoolean.create(),
    }),
    label: 'No contiene',
    impl: (value, target) => {
      if (
        typeof value !== 'string' ||
        typeof target !== 'string' ||
        target === ''
      ) {
        return true;
      }
      return !value.includes(target);
    },
  },
  startsWith: {
    type: tFunction({
      args: [tString.create(), tString.create()],
      rt: tBoolean.create(),
    }),
    label: 'Comienza con',
    impl: (value, target) => {
      if (
        typeof value !== 'string' ||
        typeof target !== 'string' ||
        target === ''
      ) {
        return true;
      }
      return value.startsWith(target);
    },
  },
  endsWith: {
    type: tFunction({
      args: [tString.create(), tString.create()],
      rt: tBoolean.create(),
    }),
    label: 'Termina con',
    impl: (value, target) => {
      if (
        typeof value !== 'string' ||
        typeof target !== 'string' ||
        target === ''
      ) {
        return true;
      }
      return value.endsWith(target);
    },
  },
} as Record<string, FilterDefineType>;
