import type { FilterDefineType } from './matcher.js';

import { tBoolean, tTag } from '../../../core/logical/data-type.js';
import {
  tArray,
  tFunction,
  tTypeRef,
  tTypeVar,
} from '../../../core/logical/typesystem.js';

export const multiTagFilter = {
  containsAll: {
    type: tFunction({
      typeVars: [tTypeVar('options', tTag.create())],
      args: [tArray(tTypeRef('options')), tArray(tTypeRef('options'))],
      rt: tBoolean.create(),
    }),
    label: 'Contiene todos',
    impl: (value, target) => {
      if (!Array.isArray(target) || !Array.isArray(value) || !target.length) {
        return true;
      }
      return target.every(v => value.includes(v));
    },
  },
  containsOneOf: {
    type: tFunction({
      typeVars: [tTypeVar('options', tTag.create())],
      args: [tArray(tTypeRef('options')), tArray(tTypeRef('options'))],
      rt: tBoolean.create(),
    }),
    name: 'containsOneOf',
    label: 'Contiene uno de',
    impl: (value, target) => {
      if (!Array.isArray(target) || !Array.isArray(value) || !target.length) {
        return true;
      }
      return target.some(v => value.includes(v));
    },
  },
  doesNotContainsOneOf: {
    type: tFunction({
      typeVars: [tTypeVar('options', tTag.create())],
      args: [tArray(tTypeRef('options')), tArray(tTypeRef('options'))],
      rt: tBoolean.create(),
    }),
    label: 'No contiene uno de',
    impl: (value, target) => {
      if (!Array.isArray(target) || !Array.isArray(value) || !target.length) {
        return true;
      }
      return target.every(v => !value.includes(v));
    },
  },
  doesNotContainsAll: {
    type: tFunction({
      typeVars: [tTypeVar('options', tTag.create())],
      args: [tArray(tTypeRef('options')), tArray(tTypeRef('options'))],
      rt: tBoolean.create(),
    }),
    label: 'No contiene todos',
    impl: (value, target) => {
      if (!Array.isArray(target) || !Array.isArray(value) || !target.length) {
        return true;
      }
      return !target.every(v => value.includes(v));
    },
  },
} as Record<string, FilterDefineType>;
