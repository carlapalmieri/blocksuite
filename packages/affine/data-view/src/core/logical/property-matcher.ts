import type { TFunction } from './typesystem.js';

import { tDate, tNumber, tString } from './data-type.js';
import { Matcher, MatcherCreator } from './matcher.js';
import { tArray, tFunction, tUnknown, typesystem } from './typesystem.js';

type PropertyData = {
  name: string;
  impl: (...args: unknown[]) => unknown;
};
const propertyMatcherCreator = new MatcherCreator<PropertyData, TFunction>();
const propertyMatchers = [
  propertyMatcherCreator.createMatcher(
    tFunction({
      args: [tString.create()],
      rt: tNumber.create(),
    }),
    {
      name: 'Longitud',
      impl: value => {
        if (typeof value !== 'string') {
          return 0;
        }
        return value.length;
      },
    }
  ),
  propertyMatcherCreator.createMatcher(
    tFunction({
      args: [tDate.create()],
      rt: tNumber.create(),
    }),
    {
      name: 'Día del mes',
      impl: value => {
        if (typeof value !== 'number') {
          return 0;
        }
        return new Date(value).getDate();
      },
    }
  ),
  propertyMatcherCreator.createMatcher(
    tFunction({
      args: [tDate.create()],
      rt: tNumber.create(),
    }),
    {
      name: 'Día de la semana',
      impl: value => {
        if (typeof value !== 'number') {
          return 0;
        }
        return new Date(value).getDay();
      },
    }
  ),
  propertyMatcherCreator.createMatcher(
    tFunction({
      args: [tDate.create()],
      rt: tNumber.create(),
    }),
    {
      name: 'Mes del año',
      impl: value => {
        if (typeof value !== 'number') {
          return 0;
        }
        return new Date(value).getMonth() + 1;
      },
    }
  ),
  propertyMatcherCreator.createMatcher(
    tFunction({
      args: [tArray(tUnknown.create())],
      rt: tNumber.create(),
    }),
    {
      name: 'Tamaño',
      impl: value => {
        if (!Array.isArray(value)) {
          return 0;
        }
        return value.length;
      },
    }
  ),
];
export const propertyMatcher = new Matcher<PropertyData, TFunction>(
  propertyMatchers,
  (type, target) => {
    if (type.type !== 'function') {
      return false;
    }
    const staticType = typesystem.subst(
      Object.fromEntries(type.typeVars?.map(v => [v.name, v.bound]) ?? []),
      type
    );
    const firstArg = staticType.args[0];
    return firstArg && typesystem.isSubtype(firstArg, target);
  }
);
