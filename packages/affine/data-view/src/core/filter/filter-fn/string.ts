import { t } from '../../logical/type-presets.js';
import { createFilter } from './create.js';

export const stringFilter = [
  createFilter({
    name: 'contains',
    self: t.string.instance(),
    args: [t.string.instance()] as const,
    label: 'Contiene',
    shortString: v => (v ? `: ${v.value}` : undefined),
    impl: (self = '', value) => {
      return self.toLowerCase().includes(value.toLowerCase());
    },
  }),
  createFilter({
    name: 'doesNoContains',
    self: t.string.instance(),
    args: [t.string.instance()] as const,
    label: 'No contiene',
    shortString: v => (v ? `: No contiene ${v.value}` : undefined),
    impl: (self = '', value) => {
      return !self.toLowerCase().includes(value.toLowerCase());
    },
  }),
  createFilter({
    name: 'startsWith',
    self: t.string.instance(),
    args: [t.string.instance()] as const,
    label: 'Comienza con',
    shortString: v => (v ? `: Comienza con ${v.value}` : undefined),
    impl: (self = '', value) => {
      return self.toLowerCase().startsWith(value.toLowerCase());
    },
  }),
  createFilter({
    name: 'endsWith',
    self: t.string.instance(),
    args: [t.string.instance()] as const,
    label: 'Termina con',
    shortString: v => (v ? `: Termina con ${v.value}` : undefined),
    impl: (self = '', value) => {
      return self.toLowerCase().endsWith(value.toLowerCase());
    },
  }),
  createFilter({
    name: 'is',
    self: t.string.instance(),
    args: [t.string.instance()] as const,
    label: 'Es',
    shortString: v => (v ? `: ${v.value}` : undefined),
    impl: (self = '', value) => {
      return self.toLowerCase() == value.toLowerCase();
    },
  }),
  createFilter({
    name: 'isNot',
    self: t.string.instance(),
    args: [t.string.instance()] as const,
    label: 'No es',
    shortString: v => (v ? `: No es ${v.value}` : undefined),
    impl: (self = '', value) => {
      return self.toLowerCase() != value.toLowerCase();
    },
  }),
];
