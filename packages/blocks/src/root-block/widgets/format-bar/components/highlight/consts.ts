interface HighlightConfig {
  name: string;
  color: string | null;
  hotkey: string | null;
}

const colors = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'grey',
];

const colorsTranslated: Record<string, string> = {
  red: 'rojo',
  orange: 'naranja',
  yellow: 'amarillo',
  green: 'verde',
  teal: 'turquesa',
  blue: 'azul',
  purple: 'morado',
  grey: 'gris',
};

export const backgroundConfig: HighlightConfig[] = [
  {
    name: 'Fondo predeterminado',
    color: null,
    hotkey: null,
  },
  ...colors.map(color => ({
    name: `Fondo ${colorsTranslated[color]}`,
    color: `var(--affine-text-highlight-${color})`,
    hotkey: null,
  })),
];

export const foregroundConfig: HighlightConfig[] = [
  {
    name: 'Texto predeterminado',
    color: null,
    hotkey: null,
  },
  ...colors.map(color => ({
    name: `Texto ${colorsTranslated[color]}`,
    color: `var(--affine-text-highlight-foreground-${color})`,
    hotkey: null,
  })),
];
