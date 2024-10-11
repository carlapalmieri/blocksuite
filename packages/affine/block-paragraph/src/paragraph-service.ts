import {
  type ParagraphBlockModel,
  ParagraphBlockSchema,
} from '@blocksuite/affine-model';
import { BlockService } from '@blocksuite/block-std';

export class ParagraphBlockService extends BlockService {
  static override readonly flavour = ParagraphBlockSchema.model.flavour;

  placeholderGenerator: (model: ParagraphBlockModel) => string = model => {
    if (model.type === 'text') {
      return "Escribe '/' para ver los comandos";
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
