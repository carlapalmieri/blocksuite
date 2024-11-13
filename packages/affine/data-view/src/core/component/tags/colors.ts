import { cssVarV2 } from '@toeverything/theme/v2';

export type SelectOptionColor = {
  oldColor: string;
  color: string;
  name: string;
};
export const selectOptionColors: SelectOptionColor[] = [
  {
    oldColor: 'var(--affine-tag-red)',
    color: cssVarV2('chip/label/red'),
    name: 'Rojo',
  },
  {
    oldColor: 'var(--affine-tag-pink)',
    color: cssVarV2('chip/label/magenta'),
    name: 'Magenta',
  },
  {
    oldColor: 'var(--affine-tag-orange)',
    color: cssVarV2('chip/label/orange'),
    name: 'Naranja',
  },
  {
    oldColor: 'var(--affine-tag-yellow)',
    color: cssVarV2('chip/label/yellow'),
    name: 'Amarillo',
  },
  {
    oldColor: 'var(--affine-tag-green)',
    color: cssVarV2('chip/label/green'),
    name: 'Verde',
  },
  {
    oldColor: 'var(--affine-tag-teal)',
    color: cssVarV2('chip/label/teal'),
    name: 'Turquesa',
  },
  {
    oldColor: 'var(--affine-tag-blue)',
    color: cssVarV2('chip/label/blue'),
    name: 'Azul',
  },
  {
    oldColor: 'var(--affine-tag-purple)',
    color: cssVarV2('chip/label/purple'),
    name: 'Morado',
  },
  {
    oldColor: 'var(--affine-tag-gray)',
    color: cssVarV2('chip/label/grey'),
    name: 'Gris',
  },
  {
    oldColor: 'var(--affine-tag-white)',
    color: cssVarV2('chip/label/white'),
    name: 'Blanco',
  },
];

const oldColorMap = Object.fromEntries(
  selectOptionColors.map(tag => [tag.oldColor, tag.color])
);

export const getColorByColor = (color: string) => {
  if (color.startsWith('--affine-tag')) {
    return oldColorMap[color] ?? color;
  }
  return color;
};

/** select tag color poll */
const selectTagColorPoll = selectOptionColors.map(color => color.color);

function tagColorHelper() {
  let colors = [...selectTagColorPoll];
  return () => {
    if (colors.length === 0) {
      colors = [...selectTagColorPoll];
    }
    const index = Math.floor(Math.random() * colors.length);
    const color = colors.splice(index, 1)[0];
    return color;
  };
}

export const getTagColor = tagColorHelper();
