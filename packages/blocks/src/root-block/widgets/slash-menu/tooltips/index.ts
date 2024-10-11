import type { TemplateResult } from 'lit';

import { AttachmentTooltip } from './attachment.js';
import { BoldTextTooltip } from './bold-text.js';
import { BulletedListTooltip } from './bulleted-list.js';
import { CodeBlockTooltip } from './code-block.js';
import { CopyTooltip } from './copy.js';
import { DeleteTooltip } from './delete.js';
import { DividerTooltip } from './divider.js';
import { EdgelessTooltip } from './edgeless.js';
import { FigmaTooltip } from './figma.js';
import { GithubRepoTooltip } from './github-repo.js';
import { Heading1Tooltip } from './heading-1.js';
import { Heading2Tooltip } from './heading-2.js';
import { Heading3Tooltip } from './heading-3.js';
import { Heading4Tooltip } from './heading-4.js';
import { Heading5Tooltip } from './heading-5.js';
import { Heading6Tooltip } from './heading-6.js';
import { ItalicTooltip } from './italic.js';
import { KanbanViewTooltip } from './kanban-view.js';
import { LinearTooltip } from './linear.js';
import { LinkTooltip } from './link.js';
import { LinkDocTooltip } from './link-doc.js';
import { MoveDownTooltip } from './move-down.js';
import { MoveUpTooltip } from './move-up.js';
import { NewDocTooltip } from './new-doc.js';
import { NowTooltip } from './now.js';
import { NumberedListTooltip } from './numbered-list.js';
import { PhotoTooltip } from './photo.js';
import { QuoteTooltip } from './quote.js';
import { StrikethroughTooltip } from './strikethrough.js';
import { TableViewTooltip } from './table-view.js';
import { TextTooltip } from './text.js';
import { ToDoListTooltip } from './to-do-list.js';
import { TodayTooltip } from './today.js';
import { TomorrowTooltip } from './tomorrow.js';
import { TweetTooltip } from './tweet.js';
import { UnderlineTooltip } from './underline.js';
import { YesterdayTooltip } from './yesterday.js';
import { YoutubeVideoTooltip } from './youtube-video.js';

export type SlashMenuTooltip = {
  figure: TemplateResult;
  caption: string;
};

export const slashMenuToolTips: Record<string, SlashMenuTooltip> = {
  Text: {
    figure: TextTooltip,
    caption: 'Texto',
  },

  'Heading 1': {
    figure: Heading1Tooltip,
    caption: 'Encabezado #1',
  },

  'Heading 2': {
    figure: Heading2Tooltip,
    caption: 'Encabezado #2',
  },

  'Heading 3': {
    figure: Heading3Tooltip,
    caption: 'Encabezado #3',
  },

  'Heading 4': {
    figure: Heading4Tooltip,
    caption: 'Encabezado #4',
  },

  'Heading 5': {
    figure: Heading5Tooltip,
    caption: 'Encabezado #5',
  },

  'Heading 6': {
    figure: Heading6Tooltip,
    caption: 'Encabezado #6',
  },

  'Code Block': {
    figure: CodeBlockTooltip,
    caption: 'Bloque de Código',
  },

  Quote: {
    figure: QuoteTooltip,
    caption: 'Cita',
  },

  Divider: {
    figure: DividerTooltip,
    caption: 'Divisor',
  },

  'Bulleted List': {
    figure: BulletedListTooltip,
    caption: 'Lista con Viñetas',
  },

  'Numbered List': {
    figure: NumberedListTooltip,
    caption: 'Lista Numerada',
  },

  'To-do List': {
    figure: ToDoListTooltip,
    caption: 'Lista de Tareas',
  },

  Bold: {
    figure: BoldTextTooltip,
    caption: 'Texto en Negrita',
  },

  Italic: {
    figure: ItalicTooltip,
    caption: 'Cursiva',
  },

  Underline: {
    figure: UnderlineTooltip,
    caption: 'Subrayado',
  },

  Strikethrough: {
    figure: StrikethroughTooltip,
    caption: 'Tachado',
  },

  'New Doc': {
    figure: NewDocTooltip,
    caption: 'Documento Nuevo',
  },

  'Linked Doc': {
    figure: LinkDocTooltip,
    caption: 'Documento Vinculado',
  },

  Link: {
    figure: LinkTooltip,
    caption: 'Enlace',
  },

  Attachment: {
    figure: AttachmentTooltip,
    caption: 'Adjunto',
  },

  Github: {
    figure: GithubRepoTooltip,
    caption: 'Repositorio de GitHub',
  },

  YouTube: {
    figure: YoutubeVideoTooltip,
    caption: 'Video de YouTube',
  },

  Image: {
    figure: PhotoTooltip,
    caption: 'Imagen',
  },

  'X (Twitter)': {
    figure: TweetTooltip,
    caption: 'Tweet',
  },

  Figma: {
    figure: FigmaTooltip,
    caption: 'Figma',
  },

  Linear: {
    figure: LinearTooltip,
    caption: 'Linear',
  },

  Today: {
    figure: TodayTooltip,
    caption: 'Hoy',
  },

  Tomorrow: {
    figure: TomorrowTooltip,
    caption: 'Mañana',
  },

  Yesterday: {
    figure: YesterdayTooltip,
    caption: 'Ayer',
  },

  Now: {
    figure: NowTooltip,
    caption: 'Ahora',
  },

  'Table View': {
    figure: TableViewTooltip,
    caption: 'Vista de Tabla',
  },

  'Kanban View': {
    figure: KanbanViewTooltip,
    caption: 'Vista de Kanban',
  },

  'Move Up': {
    figure: MoveUpTooltip,
    caption: 'Mover Arriba',
  },

  'Move Down': {
    figure: MoveDownTooltip,
    caption: 'Mover Abajo',
  },

  Copy: {
    figure: CopyTooltip,
    caption: 'Copiar / Duplicar',
  },

  Delete: {
    figure: DeleteTooltip,
    caption: 'Eliminar',
  },

  'Group & Frame': {
    figure: EdgelessTooltip,
    caption: 'Sin Bordes',
  },
};
