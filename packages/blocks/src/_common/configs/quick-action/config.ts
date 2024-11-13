import type { EditorHost } from '@blocksuite/block-std';
import type { TemplateResult } from 'lit';

import {
  CopyIcon,
  DatabaseTableViewIcon20,
  LinkedDocIcon,
} from '@blocksuite/affine-components/icons';
import { toast } from '@blocksuite/affine-components/toast';
import { matchFlavours } from '@blocksuite/affine-shared/utils';
import { tableViewMeta } from '@blocksuite/data-view/view-presets';
import { assertExists } from '@blocksuite/global/utils';

import { convertToDatabase } from '../../../database-block/data-source.js';
import { DATABASE_CONVERT_WHITE_LIST } from '../../../database-block/utils/block-utils.js';
import {
  convertSelectedBlocksToLinkedDoc,
  getTitleFromSelectedModels,
  notifyDocCreated,
  promptDocTitle,
} from '../../utils/render-linked-doc.js';

export interface QuickActionConfig {
  id: string;
  name: string;
  disabledToolTip?: string;
  icon: TemplateResult<1>;
  hotkey?: string;
  showWhen: (host: EditorHost) => boolean;
  enabledWhen: (host: EditorHost) => boolean;
  action: (host: EditorHost) => void;
}

export const quickActionConfig: QuickActionConfig[] = [
  {
    id: 'copy',
    name: 'Copiar',
    disabledToolTip: undefined,
    icon: CopyIcon,
    hotkey: undefined,
    showWhen: () => true,
    enabledWhen: () => true,
    action: host => {
      host.std.command
        .chain()
        .getSelectedModels()
        .with({
          onCopy: () => {
            toast(host, 'Copiado al portapapeles');
          },
        })
        .draftSelectedModels()
        .copySelectedModels()
        .run();
    },
  },
  {
    id: 'convert-to-database',
    name: 'Agrupar como Tabla',
    disabledToolTip:
      'Contiene tipos de bloque que no se pueden convertir a Base de datos',
    icon: DatabaseTableViewIcon20,
    showWhen: host => {
      const [_, ctx] = host.std.command
        .chain()
        .getSelectedModels({
          types: ['block', 'text'],
        })
        .run();
      const { selectedModels } = ctx;
      if (!selectedModels || selectedModels.length === 0) return false;

      const firstBlock = selectedModels[0];
      assertExists(firstBlock);
      if (matchFlavours(firstBlock, ['affine:database'])) {
        return false;
      }

      return true;
    },
    enabledWhen: host => {
      const [_, ctx] = host.std.command
        .chain()
        .getSelectedModels({
          types: ['block', 'text'],
        })
        .run();
      const { selectedModels } = ctx;
      if (!selectedModels || selectedModels.length === 0) return false;

      return selectedModels.every(block =>
        DATABASE_CONVERT_WHITE_LIST.includes(block.flavour)
      );
    },
    action: host => {
      convertToDatabase(host, tableViewMeta.type);
    },
  },
  {
    id: 'convert-to-linked-doc',
    name: 'Crear Documento Vinculado',
    icon: LinkedDocIcon,
    hotkey: `Mod-Shift-l`,
    showWhen: host => {
      const [_, ctx] = host.std.command
        .chain()
        .getSelectedModels({
          types: ['block'],
        })
        .run();
      const { selectedModels } = ctx;
      return !!selectedModels && selectedModels.length > 0;
    },
    enabledWhen: host => {
      const [_, ctx] = host.std.command
        .chain()
        .getSelectedModels({
          types: ['block'],
        })
        .run();
      const { selectedModels } = ctx;
      return !!selectedModels && selectedModels.length > 0;
    },
    action: host => {
      const [_, ctx] = host.std.command
        .chain()
        .getSelectedModels({
          types: ['block'],
          mode: 'highest',
        })
        .run();
      const { selectedModels } = ctx;
      assertExists(selectedModels);
      if (!selectedModels.length) return;

      host.selection.clear();

      const doc = host.doc;
      const autofill = getTitleFromSelectedModels(selectedModels);
      void promptDocTitle(host, autofill).then(title => {
        if (title === null) return;
        convertSelectedBlocksToLinkedDoc(doc, selectedModels, title);
        notifyDocCreated(host, doc);
      });
    },
  },
];
