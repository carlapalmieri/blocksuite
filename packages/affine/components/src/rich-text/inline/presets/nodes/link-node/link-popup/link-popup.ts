import type { EmbedOptions } from '@blocksuite/affine-shared/types';
import type { InlineRange } from '@blocksuite/inline/types';

import {
  EmbedOptionProvider,
  type LinkEventType,
  type TelemetryEvent,
  TelemetryProvider,
} from '@blocksuite/affine-shared/services';
import {
  getHostName,
  isValidUrl,
  normalizeUrl,
  stopPropagation,
} from '@blocksuite/affine-shared/utils';
import {
  BLOCK_ID_ATTR,
  type BlockComponent,
  type BlockStdScope,
} from '@blocksuite/block-std';
import { WithDisposable } from '@blocksuite/global/utils';
import { computePosition, inline, offset, shift } from '@floating-ui/dom';
import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { join } from 'lit/directives/join.js';
import { repeat } from 'lit/directives/repeat.js';

import type { EditorIconButton } from '../../../../../../toolbar/index.js';
import type { AffineInlineEditor } from '../../../affine-inline-specs.js';

import {
  ConfirmIcon,
  CopyIcon,
  DeleteIcon,
  EditIcon,
  MoreVerticalIcon,
  OpenIcon,
  SmallArrowDownIcon,
  UnlinkIcon,
} from '../../../../../../icons/index.js';
import { toast } from '../../../../../../toast/index.js';
import {
  renderActions,
  renderToolbarSeparator,
} from '../../../../../../toolbar/index.js';
import { linkPopupStyle } from './styles.js';

export class LinkPopup extends WithDisposable(LitElement) {
  static override styles = linkPopupStyle;

  private _bodyOverflowStyle = '';

  private _createTemplate = () => {
    this.updateComplete
      .then(() => {
        this.linkInput?.focus();

        this._updateConfirmBtn();
      })
      .catch(console.error);

    return html`
      <div class="affine-link-popover create">
        <input
          id="link-input"
          class="affine-link-popover-input"
          type="text"
          spellcheck="false"
          placeholder="Pegar o escribir un enlace"
          @paste=${this._updateConfirmBtn}
          @input=${this._updateConfirmBtn}
        />
        ${this._confirmBtnTemplate()}
      </div>
    `;
  };

  private _delete = () => {
    if (this.inlineEditor.isValidInlineRange(this.targetInlineRange)) {
      this.inlineEditor.deleteText(this.targetInlineRange);
    }
    this.abortController.abort();
  };

  private _edit = () => {
    if (!this.host) return;

    this.type = 'edit';

    track(this.host.std, 'OpenedAliasPopup', { control: 'edit' });
  };

  private _editTemplate = () => {
    this.updateComplete
      .then(() => {
        if (
          !this.textInput ||
          !this.linkInput ||
          !this.currentText ||
          !this.currentLink
        )
          return;

        this.textInput.value = this.currentText;
        this.linkInput.value = this.currentLink;

        this.textInput.select();

        this._updateConfirmBtn();
      })
      .catch(console.error);

    return html`
      <div class="affine-link-edit-popover">
        <div class="affine-edit-area text">
          <input
            class="affine-edit-input"
            id="text-input"
            type="text"
            placeholder="Escribe un texto"
            @input=${this._updateConfirmBtn}
          />
          <label class="affine-edit-label" for="text-input">Texto</label>
        </div>
        <div class="affine-edit-area link">
          <input
            id="link-input"
            class="affine-edit-input"
            type="text"
            spellcheck="false"
            placeholder="Pegar o escribir un enlace"
            @input=${this._updateConfirmBtn}
          />
          <label class="affine-edit-label" for="link-input">Enlace</label>
        </div>
        ${this._confirmBtnTemplate()}
      </div>
    `;
  };

  private _embedOptions: EmbedOptions | null = null;

  private _openLink = () => {
    let link = this.currentLink;
    if (!link) return;
    if (!link.match(/^[a-zA-Z]+:\/\//)) {
      link = 'https://' + link;
    }
    window.open(link, '_blank');
    this.abortController.abort();
  };

  private _removeLink = () => {
    if (this.inlineEditor.isValidInlineRange(this.targetInlineRange)) {
      this.inlineEditor.formatText(this.targetInlineRange, {
        link: null,
      });
    }
    this.abortController.abort();
  };

  private _toggleViewSelector = (e: Event) => {
    if (!this.host) return;

    const opened = (e as CustomEvent<boolean>).detail;
    if (!opened) return;

    track(this.host.std, 'OpenedViewSelector', { control: 'switch view' });
  };

  private _trackViewSelected = (type: string) => {
    if (!this.host) return;

    track(this.host.std, 'SelectedView', {
      control: 'select view',
      type: `${type} view`,
    });
  };

  private _viewTemplate = () => {
    if (!this.currentLink) return;

    this._embedOptions =
      this.std
        ?.get(EmbedOptionProvider)
        .getEmbedBlockOptions(this.currentLink) ?? null;

    const buttons = [
      html`
        <a
          class="affine-link-preview"
          href=${this.currentLink}
          rel="noopener noreferrer"
          target="_blank"
          @click=${(e: MouseEvent) => this.openLink?.(e)}
        >
          <span>${getHostName(this.currentLink)}</span>
        </a>

        <editor-icon-button
          aria-label="Copiar"
          data-testid="copy-link"
          .tooltip=${'Click para copiar el enlace'}
          @click=${this._copyUrl}
        >
          ${CopyIcon}
        </editor-icon-button>

        <editor-icon-button
          aria-label="Editar"
          data-testid="edit"
          .tooltip=${'Editar'}
          @click=${this._edit}
        >
          ${EditIcon}
        </editor-icon-button>
      `,

      this._viewSelector(),

      html`
        <editor-menu-button
          .contentPadding=${'8px'}
          .button=${html`
            <editor-icon-button aria-label="Más" .tooltip=${'Más'}>
              ${MoreVerticalIcon}
            </editor-icon-button>
          `}
        >
          <div data-size="large" data-orientation="vertical">
            ${this._moreActions()}
          </div>
        </editor-menu-button>
      `,
    ];

    return html`
      <editor-toolbar class="affine-link-popover view">
        ${join(
          buttons.filter(button => button !== nothing),
          renderToolbarSeparator
        )}
      </editor-toolbar>
    `;
  };

  private get _canConvertToEmbedView() {
    return this._embedOptions?.viewType === 'embed';
  }

  private get _isBookmarkAllowed() {
    const block = this.block;
    if (!block) return false;
    const schema = block.doc.schema;
    const parent = block.doc.getParent(block.model);
    if (!parent) return false;
    const bookmarkSchema = schema.flavourSchemaMap.get('affine:bookmark');
    if (!bookmarkSchema) return false;
    const parentSchema = schema.flavourSchemaMap.get(parent.flavour);
    if (!parentSchema) return false;

    try {
      schema.validateSchema(bookmarkSchema, parentSchema);
    } catch {
      return false;
    }

    return true;
  }

  get block() {
    const { rootElement } = this.inlineEditor;
    if (!rootElement) return null;

    const block = rootElement.closest<BlockComponent>(`[${BLOCK_ID_ATTR}]`);
    if (!block) return null;
    return block;
  }

  get currentLink() {
    return this.inlineEditor.getFormat(this.targetInlineRange).link;
  }

  get currentText() {
    return this.inlineEditor.yTextString.slice(
      this.targetInlineRange.index,
      this.targetInlineRange.index + this.targetInlineRange.length
    );
  }

  get host() {
    return this.block?.host;
  }

  get std() {
    return this.block?.std;
  }

  private _confirmBtnTemplate() {
    return html`
      <editor-icon-button
        class="affine-confirm-button"
        .iconSize=${'24px'}
        .disabled=${true}
        @click=${this._onConfirm}
      >
        ${ConfirmIcon}
      </editor-icon-button>
    `;
  }

  private _convertToCardView() {
    if (!this.inlineEditor.isValidInlineRange(this.targetInlineRange)) {
      return;
    }

    let targetFlavour = 'affine:bookmark';

    if (this._embedOptions && this._embedOptions.viewType === 'card') {
      targetFlavour = this._embedOptions.flavour;
    }

    const block = this.block;
    if (!block) return;
    const url = this.currentLink;
    const title = this.currentText;
    const props = {
      url,
      title: title === url ? '' : title,
    };
    const doc = block.doc;
    const parent = doc.getParent(block.model);
    if (!parent) return;
    const index = parent.children.indexOf(block.model);
    doc.addBlock(targetFlavour as never, props, parent, index + 1);

    const totalTextLength = this.inlineEditor.yTextLength;
    const inlineTextLength = this.targetInlineRange.length;
    if (totalTextLength === inlineTextLength) {
      doc.deleteBlock(block.model);
    } else {
      this.inlineEditor.formatText(this.targetInlineRange, { link: null });
    }

    this.abortController.abort();
  }

  private _convertToEmbedView() {
    if (!this._embedOptions || this._embedOptions.viewType !== 'embed') {
      return;
    }

    const { flavour } = this._embedOptions;
    const url = this.currentLink;

    const block = this.block;
    if (!block) return;
    const doc = block.doc;
    const parent = doc.getParent(block.model);
    if (!parent) return;
    const index = parent.children.indexOf(block.model);

    doc.addBlock(flavour as never, { url }, parent, index + 1);

    const totalTextLength = this.inlineEditor.yTextLength;
    const inlineTextLength = this.targetInlineRange.length;
    if (totalTextLength === inlineTextLength) {
      doc.deleteBlock(block.model);
    } else {
      this.inlineEditor.formatText(this.targetInlineRange, { link: null });
    }

    this.abortController.abort();
  }

  private _copyUrl() {
    if (!this.currentLink) return;
    navigator.clipboard.writeText(this.currentLink).catch(console.error);
    if (!this.host) return;
    toast(this.host, 'Enlace copiado al portapapeles');
    this.abortController.abort();

    track(this.host.std, 'CopiedLink', { control: 'copy link' });
  }

  private _moreActions() {
    return renderActions([
      [
        {
          label: 'Abrir',
          type: 'open',
          icon: OpenIcon,
          action: this._openLink,
        },

        {
          label: 'Copiar',
          type: 'copy',
          icon: CopyIcon,
          action: this._copyUrl,
        },

        {
          label: 'Remover enlace',
          type: 'remove-link',
          icon: UnlinkIcon,
          action: this._removeLink,
        },
      ],

      [
        {
          type: 'delete',
          label: 'Eliminar',
          icon: DeleteIcon,
          action: this._delete,
        },
      ],
    ]);
  }

  private _onConfirm() {
    if (!this.inlineEditor.isValidInlineRange(this.targetInlineRange)) return;
    if (!this.linkInput) return;

    const linkInputValue = this.linkInput.value;
    if (!linkInputValue || !isValidUrl(linkInputValue)) return;

    const link = normalizeUrl(linkInputValue);

    if (this.type === 'create') {
      this.inlineEditor.formatText(this.targetInlineRange, {
        link: link,
        reference: null,
      });
      this.inlineEditor.setInlineRange(this.targetInlineRange);
      const textSelection = this.host?.selection.find('text');
      if (!textSelection) return;

      this.std?.range.syncTextSelectionToRange(textSelection);
    } else if (this.type === 'edit') {
      const text = this.textInput?.value ?? link;
      this.inlineEditor.insertText(this.targetInlineRange, text, {
        link: link,
        reference: null,
      });
      this.inlineEditor.setInlineRange({
        index: this.targetInlineRange.index,
        length: text.length,
      });
      const textSelection = this.host?.selection.find('text');
      if (!textSelection) return;

      this.std?.range.syncTextSelectionToRange(textSelection);
    }

    this.abortController.abort();
  }

  private _onKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      this._onConfirm();
    }
  }

  private _updateConfirmBtn() {
    if (!this.confirmButton) {
      return;
    }
    const link = this.linkInput?.value.trim();
    const disabled = !(link && isValidUrl(link));
    this.confirmButton.disabled = disabled;
    this.confirmButton.active = !disabled;
    this.confirmButton.requestUpdate();
  }

  private _viewSelector() {
    if (!this._isBookmarkAllowed) return nothing;

    const buttons = [];

    buttons.push({
      type: 'inline',
      label: 'Vista en linea',
    });

    buttons.push({
      type: 'card',
      label: 'Vista de tarjeta',
      action: () => this._convertToCardView(),
    });

    if (this._canConvertToEmbedView) {
      buttons.push({
        type: 'embed',
        label: 'Vista incrustada',
        action: () => this._convertToEmbedView(),
      });
    }

    return html`
      <editor-menu-button
        .contentPadding=${'8px'}
        .button=${html`
          <editor-icon-button
            aria-label="Cambiar vista"
            .justify=${'space-between'}
            .labelHeight=${'20px'}
            .iconContainerWidth=${'130px'}
          >
            <div class="label">Vista en linea</div>
            ${SmallArrowDownIcon}
          </editor-icon-button>
        `}
        @toggle=${this._toggleViewSelector}
      >
        <div data-size="small" data-orientation="vertical">
          ${repeat(
            buttons,
            button => button.type,
            ({ type, label, action }) => html`
              <editor-menu-action
                data-testid=${`link-to-${type}`}
                ?data-selected=${type === 'inline'}
                ?disabled=${type === 'inline'}
                @click=${() => {
                  action?.();
                  this._trackViewSelected(type);
                }}
              >
                ${label}
              </editor-menu-action>
            `
          )}
        </div>
      </editor-menu-button>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();

    if (this.targetInlineRange.length === 0) {
      return;
    }

    if (this.type === 'edit' || this.type === 'create') {
      // disable body scroll
      this._bodyOverflowStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.disposables.add({
        dispose: () => {
          document.body.style.overflow = this._bodyOverflowStyle;
        },
      });
    }
  }

  protected override firstUpdated() {
    if (!this.linkInput) return;

    this._disposables.addFromEvent(this.linkInput, 'copy', stopPropagation);
    this._disposables.addFromEvent(this.linkInput, 'cut', stopPropagation);
    this._disposables.addFromEvent(this.linkInput, 'paste', stopPropagation);
  }

  override render() {
    return html`
      <div class="overlay-root">
        ${this.type === 'view'
          ? nothing
          : html`
              <div
                class="affine-link-popover-overlay-mask"
                @click=${() => {
                  this.abortController.abort();
                  this.host?.selection.clear();
                }}
              ></div>
            `}
        <div class="affine-link-popover-container" @keydown=${this._onKeydown}>
          ${choose(this.type, [
            ['create', this._createTemplate],
            ['edit', this._editTemplate],
            ['view', this._viewTemplate],
          ])}
        </div>
        <div class="mock-selection-container"></div>
      </div>
    `;
  }

  override updated() {
    const range = this.inlineEditor.toDomRange(this.targetInlineRange);
    if (!range) {
      return;
    }

    if (this.type !== 'view') {
      const domRects = range.getClientRects();

      Object.values(domRects).forEach(domRect => {
        if (!this.mockSelectionContainer) {
          return;
        }
        const mockSelection = document.createElement('div');
        mockSelection.classList.add('mock-selection');
        mockSelection.style.left = `${domRect.left}px`;
        mockSelection.style.top = `${domRect.top}px`;
        mockSelection.style.width = `${domRect.width}px`;
        mockSelection.style.height = `${domRect.height}px`;

        this.mockSelectionContainer.append(mockSelection);
      });
    }

    const visualElement = {
      getBoundingClientRect: () => range.getBoundingClientRect(),
      getClientRects: () => range.getClientRects(),
    };
    computePosition(visualElement, this.popupContainer, {
      middleware: [
        offset(10),
        inline(),
        shift({
          padding: 6,
        }),
      ],
    })
      .then(({ x, y }) => {
        const popupContainer = this.popupContainer;
        if (!popupContainer) return;
        popupContainer.style.left = `${x}px`;
        popupContainer.style.top = `${y}px`;
      })
      .catch(console.error);
  }

  @property({ attribute: false })
  accessor abortController!: AbortController;

  @query('.affine-confirm-button')
  accessor confirmButton: EditorIconButton | null = null;

  @property({ attribute: false })
  accessor inlineEditor!: AffineInlineEditor;

  @query('#link-input')
  accessor linkInput: HTMLInputElement | null = null;

  @query('.mock-selection-container')
  accessor mockSelectionContainer!: HTMLDivElement;

  @property({ attribute: false })
  accessor openLink: ((e?: MouseEvent) => void) | null = null;

  @query('.affine-link-popover-container')
  accessor popupContainer!: HTMLDivElement;

  @property({ attribute: false })
  accessor targetInlineRange!: InlineRange;

  @query('#text-input')
  accessor textInput: HTMLInputElement | null = null;

  @property()
  accessor type: 'create' | 'edit' | 'view' = 'create';
}

function track(
  std: BlockStdScope,
  event: LinkEventType,
  props: Partial<TelemetryEvent>
) {
  std.getOptional(TelemetryProvider)?.track(event, {
    segment: 'toolbar',
    page: 'doc editor',
    module: 'link toolbar',
    type: 'inline view',
    category: 'link',
    ...props,
  });
}
