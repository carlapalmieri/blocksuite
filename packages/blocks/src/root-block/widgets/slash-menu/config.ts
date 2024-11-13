import type {
  FrameBlockModel,
  ParagraphBlockModel,
} from '@blocksuite/affine-model';
import type { DeltaInsert } from '@blocksuite/inline';
import type { BlockModel } from '@blocksuite/store';
import type { TemplateResult } from 'lit';

import {
  FigmaIcon,
  GithubIcon,
  LoomIcon,
  YoutubeIcon,
} from '@blocksuite/affine-block-embed';
import {
  ArrowDownBigIcon,
  ArrowUpBigIcon,
  CopyIcon,
  DatabaseKanbanViewIcon20,
  DatabaseTableViewIcon20,
  DeleteIcon,
  FileIcon,
  FrameIcon,
  HeadingIcon,
  ImageIcon20,
  LinkedDocIcon,
  LinkIcon,
  NewDocIcon,
  NowIcon,
  TodayIcon,
  TomorrowIcon,
  YesterdayIcon,
} from '@blocksuite/affine-components/icons';
import {
  getInlineEditorByModel,
  insertContent,
  REFERENCE_NODE,
  textFormatConfigs,
} from '@blocksuite/affine-components/rich-text';
import { toast } from '@blocksuite/affine-components/toast';
import {
  createDefaultDoc,
  openFileOrFiles,
} from '@blocksuite/affine-shared/utils';
import { viewPresets } from '@blocksuite/data-view/view-presets';
import { assertType } from '@blocksuite/global/utils';
import { DualLinkIcon, GroupingIcon, TeXIcon } from '@blocksuite/icons/lit';
import { Slice, Text } from '@blocksuite/store';

import type { DataViewBlockComponent } from '../../../data-view-block/index.js';
import type { RootBlockComponent } from '../../types.js';
import type { AffineLinkedDocWidget } from '../linked-doc/index.js';

import { toggleEmbedCardCreateModal } from '../../../_common/components/embed-card/modal/embed-card-create-modal.js';
import { textConversionConfigs } from '../../../_common/configs/text-conversion.js';
import { addSiblingAttachmentBlocks } from '../../../attachment-block/utils.js';
import { getSurfaceBlock } from '../../../surface-ref-block/utils.js';
import { formatDate, formatTime } from '../../utils/misc.js';
import { type SlashMenuTooltip, slashMenuToolTips } from './tooltips/index.js';
import {
  createConversionItem,
  createTextFormatItem,
  insideEdgelessText,
  tryRemoveEmptyLine,
} from './utils.js';

export type SlashMenuConfig = {
  triggerKeys: string[];
  ignoreBlockTypes: BlockSuite.Flavour[];
  items: SlashMenuItem[];
  maxHeight: number;
  tooltipTimeout: number;
};

export type SlashMenuStaticConfig = Omit<SlashMenuConfig, 'items'> & {
  items: SlashMenuStaticItem[];
};

export type SlashMenuItem = SlashMenuStaticItem | SlashMenuItemGenerator;

export type SlashMenuStaticItem =
  | SlashMenuGroupDivider
  | SlashMenuActionItem
  | SlashSubMenu;

export type SlashMenuGroupDivider = {
  groupName: string;
  showWhen?: (ctx: SlashMenuContext) => boolean;
};

export type SlashMenuActionItem = {
  name: string;
  description?: string;
  icon?: TemplateResult;
  tooltip?: SlashMenuTooltip;
  alias?: string[];
  showWhen?: (ctx: SlashMenuContext) => boolean;
  action: (ctx: SlashMenuContext) => void | Promise<void>;

  customTemplate?: TemplateResult<1>;
};

export type SlashSubMenu = {
  name: string;
  description?: string;
  icon?: TemplateResult;
  alias?: string[];
  showWhen?: (ctx: SlashMenuContext) => boolean;
  subMenu: SlashMenuStaticItem[];
};

export type SlashMenuItemGenerator = (
  ctx: SlashMenuContext
) => (SlashMenuGroupDivider | SlashMenuActionItem | SlashSubMenu)[];

export type SlashMenuContext = {
  rootComponent: RootBlockComponent;
  model: BlockModel;
};

export const defaultSlashMenuConfig: SlashMenuConfig = {
  triggerKeys: ['/', '、'],
  ignoreBlockTypes: ['affine:code'],
  maxHeight: 344,
  tooltipTimeout: 300,
  items: [
    // ---------------------------------------------------------
    { groupName: 'Básico' },
    ...textConversionConfigs
      .filter(i => i.type && ['h1', 'h2', 'h3', 'text'].includes(i.type))
      .map(createConversionItem),
    {
      name: 'Otros Encabezados',
      icon: HeadingIcon,
      subMenu: [
        { groupName: 'Encabezados' },
        ...textConversionConfigs
          .filter(i => i.type && ['h4', 'h5', 'h6'].includes(i.type))
          .map<SlashMenuActionItem>(createConversionItem),
      ],
    },
    ...textConversionConfigs
      .filter(i => i.flavour === 'affine:code')
      .map<SlashMenuActionItem>(createConversionItem),

    ...textConversionConfigs
      .filter(i => i.type && ['divider', 'quote'].includes(i.type))
      .map<SlashMenuActionItem>(config => ({
        ...createConversionItem(config),
        showWhen: ({ model }) =>
          model.doc.schema.flavourSchemaMap.has(config.flavour) &&
          !insideEdgelessText(model),
      })),

    {
      name: 'Ecuación en línea',
      description: 'Crear un bloque de ecuación.',
      icon: TeXIcon({
        width: '20',
        height: '20',
      }),
      alias: ['inlineMath, inlineEquation', 'inlineLatex'],
      action: ({ rootComponent }) => {
        rootComponent.std.command
          .chain()
          .getTextSelection()
          .insertInlineLatex()
          .run();
      },
    },

    // ---------------------------------------------------------
    { groupName: 'Lista' },
    ...textConversionConfigs
      .filter(i => i.flavour === 'affine:list')
      .map(createConversionItem),

    // ---------------------------------------------------------
    { groupName: 'Estilo' },
    ...textFormatConfigs
      .filter(i => !['Code', 'Link'].includes(i.name))
      .map<SlashMenuActionItem>(createTextFormatItem),

    // ---------------------------------------------------------
    {
      groupName: 'Página',
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:embed-linked-doc'),
    },
    {
      name: 'Documento Nuevo',
      description: 'Iniciar un nuevo documento.',
      icon: NewDocIcon,
      tooltip: slashMenuToolTips['New Doc'],
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:embed-linked-doc'),
      action: ({ rootComponent, model }) => {
        const newDoc = createDefaultDoc(rootComponent.doc.collection);
        insertContent(rootComponent.host, model, REFERENCE_NODE, {
          reference: {
            type: 'LinkedPage',
            pageId: newDoc.id,
          },
        });
      },
    },
    {
      name: 'Documento Vinculado',
      description: 'Enlazar a otro documento.',
      icon: LinkedDocIcon,
      tooltip: slashMenuToolTips['Linked Doc'],
      alias: ['enlace dual'],
      showWhen: ({ rootComponent, model }) => {
        const { std } = rootComponent;
        const linkedDocWidget = std.view.getWidget(
          'affine-linked-doc-widget',
          rootComponent.model.id
        );
        if (!linkedDocWidget) return false;

        return model.doc.schema.flavourSchemaMap.has('affine:embed-linked-doc');
      },
      action: ({ model, rootComponent }) => {
        const { std } = rootComponent;

        const linkedDocWidget = std.view.getWidget(
          'affine-linked-doc-widget',
          rootComponent.model.id
        );
        if (!linkedDocWidget) return;
        assertType<AffineLinkedDocWidget>(linkedDocWidget);

        const triggerKey = linkedDocWidget.config.triggerKeys[0];

        insertContent(rootComponent.host, model, triggerKey);

        const inlineEditor = getInlineEditorByModel(rootComponent.host, model);
        // Wait for range to be updated
        inlineEditor?.slots.inlineRangeSync.once(() => {
          linkedDocWidget.show();
        });
      },
    },

    // ---------------------------------------------------------
    { groupName: 'Contenido y Medios' },
    {
      name: 'Imagen',
      description: 'Insertar una imagen.',
      icon: ImageIcon20,
      tooltip: slashMenuToolTips['Image'],
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:image'),
      action: async ({ rootComponent }) => {
        const [success, ctx] = rootComponent.std.command
          .chain()
          .getSelectedModels()
          .insertImages({ removeEmptyLine: true })
          .run();

        if (success) await ctx.insertedImageIds;
      },
    },
    {
      name: 'Enlace',
      description: 'Agregar un enlace para referencia.',
      icon: LinkIcon,
      tooltip: slashMenuToolTips['Link'],
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:bookmark'),
      action: async ({ rootComponent, model }) => {
        const parentModel = rootComponent.doc.getParent(model);
        if (!parentModel) {
          return;
        }
        const index = parentModel.children.indexOf(model) + 1;
        await toggleEmbedCardCreateModal(
          rootComponent.host,
          'Enlaces',
          'El enlace agregado se mostrará como una vista de tarjeta.',
          { mode: 'page', parentModel, index }
        );
        tryRemoveEmptyLine(model);
      },
    },
    {
      name: 'Adjunto',
      description: 'Adjuntar un archivo al documento.',
      icon: FileIcon,
      tooltip: slashMenuToolTips['Attachment'],
      alias: ['file'],
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:attachment'),
      action: async ({ rootComponent, model }) => {
        const file = await openFileOrFiles();
        if (!file) return;

        const attachmentService =
          rootComponent.std.getService('affine:attachment');
        if (!attachmentService) return;
        const maxFileSize = attachmentService.maxFileSize;

        await addSiblingAttachmentBlocks(
          rootComponent.host,
          [file],
          maxFileSize,
          model
        );
        tryRemoveEmptyLine(model);
      },
    },
    {
      name: 'YouTube',
      description: 'Incrustar un video de YouTube.',
      icon: YoutubeIcon,
      tooltip: slashMenuToolTips['YouTube'],
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:embed-youtube'),
      action: async ({ rootComponent, model }) => {
        const parentModel = rootComponent.doc.getParent(model);
        if (!parentModel) {
          return;
        }
        const index = parentModel.children.indexOf(model) + 1;
        await toggleEmbedCardCreateModal(
          rootComponent.host,
          'YouTube',
          'El enlace de video de YouTube agregado se mostrará como una vista incrustada.',
          { mode: 'page', parentModel, index }
        );
        tryRemoveEmptyLine(model);
      },
    },
    {
      name: 'GitHub',
      description: 'Enlazar a un repositorio de GitHub.',
      icon: GithubIcon,
      tooltip: slashMenuToolTips['Github'],
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:embed-github'),
      action: async ({ rootComponent, model }) => {
        const parentModel = rootComponent.doc.getParent(model);
        if (!parentModel) {
          return;
        }
        const index = parentModel.children.indexOf(model) + 1;
        await toggleEmbedCardCreateModal(
          rootComponent.host,
          'GitHub',
          'El enlace de problema o solicitud de extracción de GitHub agregado se mostrará como una vista de tarjeta.',
          { mode: 'page', parentModel, index }
        );
        tryRemoveEmptyLine(model);
      },
    },
    // TODO: X Twitter

    {
      name: 'Figma',
      description: 'Incrustar un documento de Figma.',
      icon: FigmaIcon,
      tooltip: slashMenuToolTips['Figma'],
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:embed-figma'),
      action: async ({ rootComponent, model }) => {
        const parentModel = rootComponent.doc.getParent(model);
        if (!parentModel) {
          return;
        }
        const index = parentModel.children.indexOf(model) + 1;
        await toggleEmbedCardCreateModal(
          rootComponent.host,
          'Figma',
          'El enlace de Figma agregado se mostrará como una vista incrustada.',
          { mode: 'page', parentModel, index }
        );
        tryRemoveEmptyLine(model);
      },
    },

    {
      name: 'Loom',
      icon: LoomIcon,
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:embed-loom'),
      action: async ({ rootComponent, model }) => {
        const parentModel = rootComponent.doc.getParent(model);
        if (!parentModel) {
          return;
        }
        const index = parentModel.children.indexOf(model) + 1;
        await toggleEmbedCardCreateModal(
          rootComponent.host,
          'Loom',
          'El enlace de video de Loom agregado se mostrará como una vista incrustada.',
          { mode: 'page', parentModel, index }
        );
        tryRemoveEmptyLine(model);
      },
    },

    {
      name: 'Ecuación',
      description: 'Crear un bloque de ecuación.',
      icon: TeXIcon({
        width: '20',
        height: '20',
      }),
      alias: ['mathBlock, equationBlock', 'latexBlock'],
      action: ({ rootComponent }) => {
        rootComponent.std.command
          .chain()
          .getSelectedModels()
          .insertLatexBlock({
            place: 'after',
            removeEmptyLine: true,
          })
          .run();
      },
    },

    // TODO(@L-Sun): Linear

    // ---------------------------------------------------------
    ({ model, rootComponent }) => {
      const { doc } = rootComponent;

      const surfaceModel = getSurfaceBlock(doc);
      if (!surfaceModel) return [];

      const parent = doc.getParent(model);
      if (!parent) return [];

      const frameModels = doc
        .getBlocksByFlavour('affine:frame')
        .map(block => block.model as FrameBlockModel);

      const frameItems = frameModels.map<SlashMenuActionItem>(frameModel => ({
        name: 'Marco: ' + frameModel.title,
        icon: FrameIcon,
        action: ({ rootComponent }) => {
          rootComponent.std.command
            .chain()
            .getSelectedModels()
            .insertSurfaceRefBlock({
              reference: frameModel.id,
              place: 'after',
              removeEmptyLine: true,
            })
            .run();
        },
      }));

      const groupElements = surfaceModel.getElementsByType('group');
      const groupItems = groupElements.map(group => ({
        name: 'Grupo: ' + group.title.toString(),
        icon: GroupingIcon(),
        action: () => {
          rootComponent.std.command
            .chain()
            .getSelectedModels()
            .insertSurfaceRefBlock({
              reference: group.id,
              place: 'after',
              removeEmptyLine: true,
            })
            .run();
        },
      }));

      const items = [...frameItems, ...groupItems];
      if (items.length !== 0) {
        return [
          {
            groupName: 'Grupo de Documento y Marco',
          },
          ...items,
        ];
      } else {
        return [];
      }
    },

    // ---------------------------------------------------------
    { groupName: 'Fecha' },
    () => {
      const now = new Date();
      const tomorrow = new Date();
      const yesterday = new Date();

      yesterday.setDate(yesterday.getDate() - 1);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return [
        {
          name: 'Hoy',
          icon: TodayIcon,
          tooltip: slashMenuToolTips['Hoy'],
          description: formatDate(now),
          action: ({ rootComponent, model }) => {
            insertContent(rootComponent.host, model, formatDate(now));
          },
        },
        {
          name: 'Mañana',
          icon: TomorrowIcon,
          tooltip: slashMenuToolTips['Mañana'],
          description: formatDate(tomorrow),
          action: ({ rootComponent, model }) => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            insertContent(rootComponent.host, model, formatDate(tomorrow));
          },
        },
        {
          name: 'Ayer',
          icon: YesterdayIcon,
          tooltip: slashMenuToolTips['Ayer'],
          description: formatDate(yesterday),
          action: ({ rootComponent, model }) => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            insertContent(rootComponent.host, model, formatDate(yesterday));
          },
        },
        {
          name: 'Ahora',
          icon: NowIcon,
          tooltip: slashMenuToolTips['Ahora'],
          description: formatTime(now),
          action: ({ rootComponent, model }) => {
            insertContent(rootComponent.host, model, formatTime(now));
          },
        },
      ];
    },

    // ---------------------------------------------------------
    { groupName: 'Base de Datos' },
    {
      name: 'Vista de Tabla',
      description: 'Agregar una vista de tabla.',
      alias: ['database'],
      icon: DatabaseTableViewIcon20,
      tooltip: slashMenuToolTips['Vista de Tabla'],
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:database') &&
        !insideEdgelessText(model),
      action: ({ rootComponent }) => {
        rootComponent.std.command
          .chain()
          .getSelectedModels()
          .insertDatabaseBlock({
            viewType: viewPresets.tableViewMeta.type,
            place: 'after',
            removeEmptyLine: true,
          })
          .run();
      },
    },
    {
      name: 'Tareas',
      alias: ['todo view'],
      icon: DatabaseTableViewIcon20,
      tooltip: slashMenuToolTips['Tareas'],
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:database') &&
        !insideEdgelessText(model) &&
        !!model.doc.awarenessStore.getFlag('enable_block_query'),

      action: ({ model, rootComponent }) => {
        const parent = rootComponent.doc.getParent(model);
        if (!parent) return;
        const index = parent.children.indexOf(model);
        const id = rootComponent.doc.addBlock(
          'affine:data-view',
          {},
          rootComponent.doc.getParent(model),
          index + 1
        );
        const dataViewModel = rootComponent.doc.getBlock(id)!;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.resolve().then(() => {
          const dataView = rootComponent.std.view.getBlock(
            dataViewModel.id
          ) as DataViewBlockComponent | null;
          dataView?.dataSource.viewManager.viewAdd('table');
        });
        tryRemoveEmptyLine(model);
      },
    },
    {
      name: 'Vista Kanban',
      description: 'Visualizar datos en un tablero.',
      alias: ['database'],
      icon: DatabaseKanbanViewIcon20,
      tooltip: slashMenuToolTips['Vista Kanban'],
      showWhen: ({ model }) =>
        model.doc.schema.flavourSchemaMap.has('affine:database') &&
        !insideEdgelessText(model),
      action: ({ rootComponent }) => {
        rootComponent.std.command
          .chain()
          .getSelectedModels()
          .insertDatabaseBlock({
            viewType: viewPresets.kanbanViewMeta.type,
            place: 'after',
            removeEmptyLine: true,
          })
          .run();
      },
    },

    // ---------------------------------------------------------
    { groupName: 'Acciones' },
    {
      name: 'Mover Arriba',
      description: 'Mover esta línea hacia arriba.',
      icon: ArrowUpBigIcon,
      tooltip: slashMenuToolTips['Mover Arriba'],
      action: ({ rootComponent, model }) => {
        const doc = rootComponent.doc;
        const previousSiblingModel = doc.getPrev(model);
        if (!previousSiblingModel) return;

        const parentModel = doc.getParent(previousSiblingModel);
        if (!parentModel) return;

        doc.moveBlocks([model], parentModel, previousSiblingModel, true);
      },
    },
    {
      name: 'Mover Abajo',
      description: 'Mover esta línea hacia abajo.',
      icon: ArrowDownBigIcon,
      tooltip: slashMenuToolTips['Mover Abajo'],
      action: ({ rootComponent, model }) => {
        const doc = rootComponent.doc;
        const nextSiblingModel = doc.getNext(model);
        if (!nextSiblingModel) return;

        const parentModel = doc.getParent(nextSiblingModel);
        if (!parentModel) return;

        doc.moveBlocks([model], parentModel, nextSiblingModel, false);
      },
    },
    {
      name: 'Copiar',
      description: 'Copiar esta línea al portapapeles.',
      icon: CopyIcon,
      tooltip: slashMenuToolTips['Copiar'],
      action: ({ rootComponent, model }) => {
        const slice = Slice.fromModels(rootComponent.std.doc, [model]);

        rootComponent.std.clipboard
          .copy(slice)
          .then(() => {
            toast(rootComponent.host, 'Copiado al portapapeles');
          })
          .catch(e => {
            console.error(e);
          });
      },
    },
    {
      name: 'Duplicar',
      description: 'Crear un duplicado de esta línea.',
      icon: DualLinkIcon({ width: '20', height: '20' }),
      tooltip: slashMenuToolTips['Duplicar'],
      action: ({ rootComponent, model }) => {
        if (!model.text || !(model.text instanceof Text)) {
          console.error('No se puede duplicar un bloque sin texto');
          return;
        }
        const parent = rootComponent.doc.getParent(model);
        if (!parent) {
          console.error(
            'No se pudo duplicar el bloque! No se encontró el padre: ' +
              model.id +
              '|' +
              model.flavour
          );
          return;
        }
        const index = parent.children.indexOf(model);

        // TODO add clone model util
        rootComponent.doc.addBlock(
          model.flavour as never,
          {
            type: (model as ParagraphBlockModel).type,
            text: new rootComponent.doc.Text(
              model.text.toDelta() as DeltaInsert[]
            ),
            // @ts-expect-error
            checked: model.checked,
          },
          rootComponent.doc.getParent(model),
          index
        );
      },
    },
    {
      name: 'Eliminar',
      description: 'Eliminar línea permanentemente.',
      alias: ['remove'],
      icon: DeleteIcon,
      tooltip: slashMenuToolTips['Eliminar'],
      action: ({ rootComponent, model }) => {
        rootComponent.doc.deleteBlock(model);
      },
    },
  ],
};
