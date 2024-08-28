import {
  type InsertToPosition,
  insertPositionToIndex,
} from '@blocksuite/affine-shared/utils';
import { ShadowlessElement, WithDisposable } from '@blocksuite/block-std';
import { assertExists } from '@blocksuite/global/utils';
import { SignalWatcher } from '@lit-labs/preact-signals';
import { css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit/static-html.js';

import type { NumberColumnDataType } from '../../../../../column/presets/number/define.js';
import type { Column } from '../../../../../view-manager/column.js';
import type { TableColumn, TableSingleView } from '../../table-view-manager.js';

import {
  type Menu,
  type NormalMenu,
  popMenu,
} from '../../../../../../../_common/components/index.js';
import { numberFormats } from '../../../../../column/presets/number/utils/formats.js';
import { inputConfig, typeConfig } from '../../../../../common/column-menu.js';
import {
  DatabaseDuplicate,
  DatabaseInsertLeft,
  DatabaseInsertRight,
  DatabaseMoveLeft,
  DatabaseMoveRight,
  DeleteIcon,
} from '../../../../../common/icons/index.js';
import { startDrag } from '../../../../../utils/drag.js';
import { autoScrollOnBoundary } from '../../../../../utils/frame-loop.js';
import { renderUniLit } from '../../../../../utils/uni-component/index.js';
import { getResultInRange } from '../../../../../utils/utils.js';
import { DEFAULT_COLUMN_TITLE_HEIGHT } from '../../consts.js';
import { getTableContainer } from '../../types.js';
import { DataViewColumnPreview } from './column-renderer.js';
import './number-format-bar.js';
import {
  getTableGroupRects,
  getVerticalIndicator,
  startDragWidthAdjustmentBar,
} from './vertical-indicator.js';

@customElement('affine-database-header-column')
export class DatabaseHeaderColumn extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  private _clickColumn = () => {
    if (this.tableViewManager.readonly$.value) {
      return;
    }
    this.popMenu();
  };

  private _clickTypeIcon = (event: MouseEvent) => {
    if (this.tableViewManager.readonly$.value) {
      return;
    }
    if (this.column.type === 'title') {
      return;
    }
    event.stopPropagation();
    popMenu(this, {
      options: {
        input: {
          search: true,
          placeholder: 'Search',
        },
        items: this.tableViewManager.allColumnConfig.map(config => {
          return {
            type: 'action',
            name: config.name,
            isSelected: config.type === this.column.type,
            icon: renderUniLit(this.tableViewManager.getIcon(config.type)),
            select: () => {
              this.column.updateType?.(config.type);
            },
          };
        }),
      },
    });
  };

  private _columnsOffset = (header: Element, _scale: number) => {
    const columns = header.querySelectorAll('affine-database-header-column');
    const left: ColumnOffset[] = [];
    const right: ColumnOffset[] = [];
    let curr = left;
    const offsetArr: number[] = [];
    const columnsArr = Array.from(columns);
    for (let i = 0; i < columnsArr.length; i++) {
      const v = columnsArr[i];
      if (v === this) {
        curr = right;
        offsetArr.push(-1);
        continue;
      }
      curr.push({
        x: v.offsetLeft + v.offsetWidth / 2,
        ele: v,
      });
      offsetArr.push(
        v.getBoundingClientRect().left - header.getBoundingClientRect().left
      );
      if (i === columnsArr.length - 1) {
        offsetArr.push(
          v.getBoundingClientRect().right - header.getBoundingClientRect().left
        );
      }
    }
    left.reverse();
    const getInsertPosition = (offset: number, width: number) => {
      let result: InsertToPosition | undefined = undefined;
      for (let i = 0; i < left.length; i++) {
        const { x, ele } = left[i];
        if (x < offset) {
          if (result) {
            return result;
          }
          break;
        } else {
          result = {
            before: true,
            id: ele.column.id,
          };
        }
      }
      const offsetRight = offset + width;
      for (const { x, ele } of right) {
        if (x > offsetRight) {
          if (result) {
            return result;
          }
          break;
        } else {
          result = {
            before: false,
            id: ele.column.id,
          };
        }
      }
      return result;
    };
    const fixedColumns = columnsArr.map(v => ({ id: v.column.id }));
    const getInsertOffset = (insertPosition: InsertToPosition) => {
      return offsetArr[insertPositionToIndex(insertPosition, fixedColumns)];
    };
    return {
      computeInsertInfo: (offset: number, width: number) => {
        const insertPosition = getInsertPosition(offset, width);
        return {
          insertPosition: insertPosition,
          insertOffset: insertPosition
            ? getInsertOffset(insertPosition)
            : undefined,
        };
      },
    };
  };

  private _contextMenu = (e: MouseEvent) => {
    if (this.tableViewManager.readonly$.value) {
      return;
    }
    e.preventDefault();
    this.popMenu(e.target as HTMLElement);
  };

  private _enterWidthDragBar = () => {
    if (this.tableViewManager.readonly$.value) {
      return;
    }
    if (this.drawWidthDragBarTask) {
      cancelAnimationFrame(this.drawWidthDragBarTask);
      this.drawWidthDragBarTask = 0;
    }
    this.drawWidthDragBar();
  };

  private _leaveWidthDragBar = () => {
    cancelAnimationFrame(this.drawWidthDragBarTask);
    this.drawWidthDragBarTask = 0;
    getVerticalIndicator().remove();
  };

  private drawWidthDragBar = () => {
    const tableContainer = getTableContainer(this);
    const tableRect = tableContainer.getBoundingClientRect();
    const rectList = getTableGroupRects(tableContainer);
    getVerticalIndicator().display(
      0,
      tableRect.top,
      rectList,
      this.getBoundingClientRect().right
    );
    this.drawWidthDragBarTask = requestAnimationFrame(this.drawWidthDragBar);
  };

  private drawWidthDragBarTask = 0;

  private moveColumn = (evt: PointerEvent) => {
    const tableContainer = getTableContainer(this);
    const headerContainer = this.closest('affine-database-column-header');
    const scrollContainer = tableContainer?.parentElement;
    assertExists(headerContainer);
    assertExists(tableContainer);
    assertExists(scrollContainer);
    const columnHeaderRect = this.getBoundingClientRect();
    const scale = columnHeaderRect.width / this.column.width$.value;
    const headerContainerRect = tableContainer.getBoundingClientRect();

    const rectOffsetLeft = evt.x - columnHeaderRect.left;
    const offsetRight = columnHeaderRect.right - evt.x;

    const startOffset =
      (columnHeaderRect.left - headerContainerRect.left) / scale;
    const max = (headerContainerRect.width - columnHeaderRect.width) / scale;

    const { computeInsertInfo } = this._columnsOffset(headerContainer, scale);
    const column = new DataViewColumnPreview();
    column.tableViewManager = this.tableViewManager;
    column.column = this.column;
    column.table = tableContainer;
    const dragPreview = createDragPreview(
      tableContainer,
      columnHeaderRect.width / scale,
      headerContainerRect.height / scale,
      startOffset,
      column
    );
    const rectList = getTableGroupRects(tableContainer);
    const dropPreview = getVerticalIndicator();
    const cancelScroll = autoScrollOnBoundary(scrollContainer, {
      boundary: {
        left: rectOffsetLeft,
        right: offsetRight,
      },
      onScroll: () => {
        drag.move({ x: drag.last.x });
      },
    });
    const html = document.querySelector('html');
    html?.classList.toggle('affine-database-header-column-grabbing', true);
    const drag = startDrag<{
      insertPosition?: InsertToPosition;
    }>(evt, {
      onDrag: () => {
        this.grabStatus = 'grabbing';
        return {};
      },
      onMove: ({ x }: { x: number }) => {
        this.grabStatus = 'grabbing';
        const currentOffset = getResultInRange(
          (x - tableContainer.getBoundingClientRect().left - rectOffsetLeft) /
            scale,
          0,
          max
        );
        const insertInfo = computeInsertInfo(
          currentOffset,
          columnHeaderRect.width / scale
        );
        if (insertInfo.insertOffset != null) {
          dropPreview.display(
            0,
            headerContainerRect.top,
            rectList,
            tableContainer.getBoundingClientRect().left +
              insertInfo.insertOffset,
            true
          );
        } else {
          dropPreview.remove();
        }
        dragPreview.display(currentOffset);
        return {
          insertPosition: insertInfo.insertPosition,
        };
      },
      onDrop: ({ insertPosition }) => {
        this.grabStatus = 'grabEnd';
        if (insertPosition) {
          this.tableViewManager.columnMove(this.column.id, insertPosition);
        }
      },
      onClear: () => {
        cancelScroll();
        html?.classList.toggle('affine-database-header-column-grabbing', false);
        dropPreview.remove();
        dragPreview.remove();
      },
    });
  };

  private widthDragBar = createRef();

  static override styles = css`
    affine-database-header-column {
      display: flex;
    }

    .affine-database-header-column-grabbing * {
      cursor: grabbing;
    }
  `;

  editTitle = () => {
    this._clickColumn();
  };

  private popMenu(ele?: HTMLElement) {
    const enableNumberFormatting =
      this.tableViewManager.featureFlags$.value.enable_number_formatting;

    popMenu(ele ?? this, {
      options: {
        input: inputConfig(this.column),
        items: [
          {
            type: 'group',
            name: 'Column Prop Group ',
            children: () => [
              typeConfig(this.column),
              // Number format begin
              ...(enableNumberFormatting
                ? ([
                    {
                      type: 'sub-menu',
                      name: 'Number Format',

                      hide: () =>
                        !this.column.updateData ||
                        this.column.type !== 'number',
                      options: {
                        input: {
                          search: true,
                        },
                        items: [
                          numberFormatConfig(this.column),
                          ...(numberFormats.map(format => {
                            const data = (
                              this.column as Column<
                                number,
                                NumberColumnDataType
                              >
                            ).data$.value;
                            return {
                              type: 'action',
                              isSelected: data.format === format.type,
                              icon: html`<span
                                style="font-size: var(--affine-font-base); scale: 1.2;"
                                >${format.symbol}</span
                              >`,
                              name: format.label,
                              select: () => {
                                if (data.format === format.type) return;
                                this.column.updateData(() => ({
                                  format: format.type,
                                }));
                              },
                            };
                          }) as Menu[]),
                        ],
                      },
                    },
                  ] as Menu[])
                : []),
              // Number format end
            ],
          },

          {
            type: 'action',
            name: 'Duplicate Column',
            icon: DatabaseDuplicate,
            hide: () => !this.column.duplicate || this.column.type === 'title',
            select: () => {
              this.column.duplicate?.();
            },
          },
          {
            type: 'action',
            name: 'Insert Left Column',
            icon: DatabaseInsertLeft,
            select: () => {
              this.tableViewManager.columnAdd({
                id: this.column.id,
                before: true,
              });
              Promise.resolve()
                .then(() => {
                  const pre = this.previousElementSibling;
                  if (pre instanceof DatabaseHeaderColumn) {
                    pre.editTitle();
                    pre.scrollIntoView({ inline: 'nearest', block: 'nearest' });
                  }
                })
                .catch(console.error);
            },
          },
          {
            type: 'action',
            name: 'Insert Right Column',
            icon: DatabaseInsertRight,
            select: () => {
              this.tableViewManager.columnAdd({
                id: this.column.id,
                before: false,
              });
              Promise.resolve()
                .then(() => {
                  const next = this.nextElementSibling;
                  if (next instanceof DatabaseHeaderColumn) {
                    next.editTitle();
                    next.scrollIntoView({
                      inline: 'nearest',
                      block: 'nearest',
                    });
                  }
                })
                .catch(console.error);
            },
          },
          {
            type: 'action',
            name: 'Move Left',
            icon: DatabaseMoveLeft,
            hide: () => this.column.isFirst,
            select: () => {
              const preId = this.tableViewManager.columnGetPreColumn(
                this.column.id
              )?.id;
              if (!preId) {
                return;
              }
              this.tableViewManager.columnMove(this.column.id, {
                id: preId,
                before: true,
              });
            },
          },
          {
            type: 'action',
            name: 'Move Right',
            icon: DatabaseMoveRight,
            hide: () => this.column.isLast,
            select: () => {
              const nextId = this.tableViewManager.columnGetNextColumn(
                this.column.id
              )?.id;
              if (!nextId) {
                return;
              }
              this.tableViewManager.columnMove(this.column.id, {
                id: nextId,
                before: false,
              });
            },
          },
          {
            type: 'group',
            name: 'operation',
            children: () => [
              {
                type: 'action',
                name: 'Delete Column',
                icon: DeleteIcon,
                hide: () => !this.column.delete || this.column.type === 'title',
                select: () => {
                  this.column.delete?.();
                },
                class: 'delete-item',
              },
            ],
          },
        ],
      },
    });
  }

  private get readonly() {
    return this.tableViewManager.readonly$.value;
  }

  private widthDragStart(event: PointerEvent) {
    startDragWidthAdjustmentBar(
      event,
      getTableContainer(this),
      this.getBoundingClientRect().width,
      this.column
    );
  }

  override connectedCallback() {
    super.connectedCallback();
    const table = this.closest('affine-database-table');
    if (table) {
      this.disposables.add(
        table.handleEvent('dragStart', context => {
          if (this.tableViewManager.readonly$.value) {
            return;
          }
          const event = context.get('pointerState').raw;
          const target = event.target;
          if (target instanceof Element) {
            if (this.widthDragBar.value?.contains(target)) {
              event.preventDefault();
              this.widthDragStart(event);
              return true;
            }
            if (this.contains(target)) {
              event.preventDefault();
              this.moveColumn(event);
              return true;
            }
          }
          return false;
        })
      );
    }
  }

  override render() {
    const column = this.column;
    const style = styleMap({
      height: DEFAULT_COLUMN_TITLE_HEIGHT + 'px',
    });
    const classes = classMap({
      'affine-database-column-move': true,
      [this.grabStatus]: true,
    });
    return html`
      <div
        style=${style}
        class="affine-database-column-content"
        @click="${this._clickColumn}"
        @contextmenu="${this._contextMenu}"
      >
        ${this.readonly
          ? null
          : html` <button class="${classes}">
              <div class="hover-trigger"></div>
              <div class="control-h"></div>
              <div class="control-l"></div>
              <div class="control-r"></div>
            </button>`}
        <div class="affine-database-column-text ${column.type}">
          <div
            class="affine-database-column-type-icon dv-hover"
            @click="${this._clickTypeIcon}"
          >
            <uni-lit .uni="${column.icon}"></uni-lit>
          </div>
          <div class="affine-database-column-text-content">
            <div class="affine-database-column-text-input">${column.name}</div>
          </div>
        </div>
      </div>
      <div
        ${ref(this.widthDragBar)}
        @mouseenter="${this._enterWidthDragBar}"
        @mouseleave="${this._leaveWidthDragBar}"
        style="width: 0;position: relative;height: 100%;z-index: 1;cursor: col-resize"
      >
        <div style="width: 8px;height: 100%;margin-left: -4px;"></div>
      </div>
    `;
  }

  @property({ attribute: false })
  accessor column!: TableColumn;

  @property({ attribute: false })
  accessor grabStatus: 'grabStart' | 'grabEnd' | 'grabbing' = 'grabEnd';

  @property({ attribute: false })
  accessor tableViewManager!: TableSingleView;
}

type ColumnOffset = {
  x: number;
  ele: DatabaseHeaderColumn;
};

const createDragPreview = (
  container: Element,
  width: number,
  height: number,
  startLeft: number,
  content: HTMLElement
) => {
  const div = document.createElement('div');
  div.append(content);
  // div.style.pointerEvents='none';
  div.style.opacity = '0.8';
  div.style.position = 'absolute';
  div.style.width = `${width}px`;
  div.style.height = `${height}px`;
  div.style.left = `${startLeft}px`;
  div.style.top = `0px`;
  div.style.zIndex = '9';
  container.append(div);
  return {
    display(offset: number) {
      div.style.left = `${Math.round(offset)}px`;
    },
    remove() {
      div.remove();
    },
  };
};

function numberFormatConfig(column: Column): NormalMenu {
  return {
    type: 'custom',
    render: () =>
      html` <affine-database-number-format-bar
        .column="${column}"
      ></affine-database-number-format-bar>`,
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'affine-database-header-column': DatabaseHeaderColumn;
  }
}
