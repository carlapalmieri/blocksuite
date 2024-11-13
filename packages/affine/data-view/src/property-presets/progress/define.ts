import { t } from '../../core/logical/type-presets.js';
import { propertyType } from '../../core/property/property-config.js';

export const progressPropertyType = propertyType('progress');

export const progressPropertyModelConfig =
  progressPropertyType.modelConfig<number>({
    name: 'Progreso',
    type: () => t.number.instance(),
    defaultData: () => ({}),
    cellToString: ({ value }) => value?.toString() ?? '',
    cellFromString: ({ value }) => {
      const num = value ? Number(value) : NaN;
      return {
        value: isNaN(num) ? null : num,
      };
    },
    cellToJson: ({ value }) => value ?? null,
    isEmpty: () => false,
  });
