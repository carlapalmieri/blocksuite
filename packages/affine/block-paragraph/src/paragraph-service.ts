import {
  type ParagraphBlockModel,
  ParagraphBlockSchema,
} from '@blocksuite/affine-model';
import { BlockService } from '@blocksuite/block-std';
import { html, type TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

export class ParagraphBlockService extends BlockService {
  static override readonly flavour = ParagraphBlockSchema.model.flavour;

  inlineCodeStyle = {
    'font-family': 'var(--affine-font-code-family)',
    background: 'var(--affine-background-code-block)',
    border: '1px solid var(--affine-border-color)',
    'border-radius': '4px',
    'font-variant-ligatures': 'none',
    'line-height': 'auto',
    'margin-top': '-1px',
  };

  placeholderGenerator: (
    model: ParagraphBlockModel
  ) => string | TemplateResult = model => {
    if (model.type === 'text') {
      const template = html`<div>
        Escribe <code style=${styleMap(this.inlineCodeStyle)}>/</code> para ver
        los comandos
      </div>`;
      return template;
    }

    const placeholders = {
      h1: 'Encabezado 1',
      h2: 'Encabezado 2',
      h3: 'Encabezado 3',
      h4: 'Encabezado 4',
      h5: 'Encabezado 5',
      h6: 'Encabezado 6',
      quote: '',
    };
    return placeholders[model.type];
  };
}
