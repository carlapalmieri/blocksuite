import type { MenuItemGroup } from '@blocksuite/affine-components/toolbar';

import {
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  DuplicateIcon,
  RefreshIcon,
} from '@blocksuite/affine-components/icons';

import type { AttachmentToolbarMoreMenuContext } from './context.js';

import { cloneAttachmentProperties } from '../utils.js';

export const BUILT_IN_GROUPS: MenuItemGroup<AttachmentToolbarMoreMenuContext>[] =
  [
    {
      type: 'clipboard',
      items: [
        {
          type: 'copy',
          label: 'Copiar',
          icon: CopyIcon,
          disabled: ({ doc }) => doc.readonly,
          action: ctx => ctx.blockComponent.copy(),
        },
        {
          type: 'duplicate',
          label: 'Duplicar',
          icon: DuplicateIcon,
          disabled: ({ doc }) => doc.readonly,
          action: ({ doc, blockComponent, close }) => {
            const model = blockComponent.model;
            const prop: { flavour: 'affine:attachment' } = {
              flavour: 'affine:attachment',
              ...cloneAttachmentProperties(model),
            };
            doc.addSiblingBlocks(model, [prop]);
            close();
          },
        },
        {
          type: 'reload',
          label: 'Recargar',
          icon: RefreshIcon,
          disabled: ({ doc }) => doc.readonly,
          action: ({ blockComponent, close }) => {
            blockComponent.refreshData();
            close();
          },
        },
        {
          type: 'download',
          label: 'Descargar',
          icon: DownloadIcon,
          disabled: ({ doc }) => doc.readonly,
          action: ({ blockComponent, close }) => {
            blockComponent.download();
            close();
          },
        },
      ],
    },
    {
      type: 'delete',
      items: [
        {
          type: 'delete',
          label: 'Eliminar',
          icon: DeleteIcon,
          disabled: ({ doc }) => doc.readonly,
          action: ({ doc, blockComponent, close }) => {
            doc.deleteBlock(blockComponent.model);
            close();
          },
        },
      ],
    },
  ];
