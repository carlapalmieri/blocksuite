import { ct } from '../../logical/composite-type.js';
import { t } from '../../logical/type-presets.js';
import { tRef, tVar } from '../../logical/type-variable.js';
import { createFilter } from './create.js';
import { tagToString } from './utils.js';

const optionName = 'option' as const;
export const multiTagFilter = [
  createFilter({
    name: 'containsOneOf',
    vars: [tVar(optionName, t.tag.instance())] as const,
    self: ct.array.instance(tRef(optionName)),
    args: [ct.array.instance(tRef(optionName))] as const,
    label: 'Contiene uno de',
    shortString: v =>
      v ? `: ${tagToString(v.value, v.type.element)}` : undefined,
    impl: (self, value) => {
      if (!value.length) {
        return true;
      }
      if (self == null) {
        return false;
      }
      return value.some(v => self.includes(v));
    },
  }),
  createFilter({
    name: 'doesNotContainOneOf',
    vars: [tVar(optionName, t.tag.instance())] as const,
    self: ct.array.instance(tRef(optionName)),
    args: [ct.array.instance(tRef(optionName))] as const,
    label: 'No contiene uno de',
    shortString: v =>
      v ? `: No ${tagToString(v.value, v.type.element)}` : undefined,
    impl: (self, value) => {
      if (!value.length) {
        return true;
      }
      if (self == null) {
        return true;
      }
      return value.every(v => !self.includes(v));
    },
  }),
  createFilter({
    name: 'containsAll',
    vars: [tVar(optionName, t.tag.instance())] as const,
    self: ct.array.instance(tRef(optionName)),
    args: [ct.array.instance(tRef(optionName))] as const,
    label: 'Contiene todos',
    shortString: v =>
      v ? `: ${tagToString(v.value, v.type.element)}` : undefined,
    impl: (self, value) => {
      if (!value.length) {
        return true;
      }
      if (self == null) {
        return false;
      }
      return value.every(v => self.includes(v));
    },
  }),
  createFilter({
    name: 'doesNotContainAll',
    vars: [tVar(optionName, t.tag.instance())] as const,
    self: ct.array.instance(tRef(optionName)),
    args: [ct.array.instance(tRef(optionName))] as const,
    label: 'No contiene todos',
    shortString: v =>
      v ? `: No ${tagToString(v.value, v.type.element)}` : undefined,
    impl: (self, value) => {
      if (!value.length) {
        return true;
      }
      if (self == null) {
        return true;
      }
      return !value.every(v => self.includes(v));
    },
  }),
];
