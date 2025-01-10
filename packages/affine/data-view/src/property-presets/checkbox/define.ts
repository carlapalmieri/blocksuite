import { t } from '../../core/logical/type-presets.js';
import { propertyType } from '../../core/property/property-config.js';

export const checkboxPropertyType = propertyType('checkbox');

export const checkboxPropertyModelConfig =
  checkboxPropertyType.modelConfig<boolean>({
    name: 'Casilla',
    type: () => t.boolean.instance(),
    defaultData: () => ({}),
    cellToString: ({ value }) => (value ? 'Verdadero' : 'Falso'),
    cellFromString: ({ value }) => {
      return {
        value: value !== 'Falso',
      };
    },
    cellToJson: ({ value }) => value ?? null,
    cellFromJson: ({ value }) =>
      typeof value !== 'boolean' ? undefined : value,
    isEmpty: () => false,
    minWidth: 34,
  });
