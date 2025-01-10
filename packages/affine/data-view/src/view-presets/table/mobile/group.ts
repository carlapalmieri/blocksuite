import {
  menu,
  popFilterableSimpleMenu,
  popupTargetFromElement,
} from '@blocksuite/affine-components/context-menu';
import { ShadowlessElement } from '@blocksuite/block-std';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/utils';
import { PlusIcon } from '@blocksuite/icons/lit';
import { css, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import type { DataViewRenderer } from '../../../core/data-view.js';
import type { GroupData } from '../../../core/group-by/trait.js';
import type { DataViewTable } from '../pc/table-view.js';
import type { TableSingleView } from '../table-view-manager.js';

import { GroupTitle } from '../../../core/group-by/group-title.js';
import { LEFT_TOOL_BAR_WIDTH } from '../consts.js';
import { TableAreaSelection } from '../types.js';

const styles = css`
  .data-view-table-group-add-row {
    display: flex;
    width: 100%;
    height: 28px;
    position: relative;
    z-index: 0;
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;
    padding: 4px 8px;
    border-bottom: 1px solid var(--affine-border-color);
  }

  .data-view-table-group-add-row-button {
    position: sticky;
    left: ${8 + LEFT_TOOL_BAR_WIDTH}px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    user-select: none;
    font-size: 12px;
    line-height: 20px;
    color: var(--affine-text-secondary-color);
  }
`;

export class MobileTableGroup extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  static override styles = styles;

  private clickAddRow = () => {
    this.view.rowAdd('end', this.group?.key);
    requestAnimationFrame(() => {
      const selectionController = this.viewEle.selectionController;
      const index = this.view.properties$.value.findIndex(
        v => v.type$.value === 'title'
      );
      selectionController.selection = TableAreaSelection.create({
        groupKey: this.group?.key,
        focus: {
          rowIndex: this.rows.length - 1,
          columnIndex: index,
        },
        isEditing: true,
      });
    });
  };

  private clickAddRowInStart = () => {
    this.view.rowAdd('start', this.group?.key);
    requestAnimationFrame(() => {
      const selectionController = this.viewEle.selectionController;
      const index = this.view.properties$.value.findIndex(
        v => v.type$.value === 'title'
      );
      selectionController.selection = TableAreaSelection.create({
        groupKey: this.group?.key,
        focus: {
          rowIndex: 0,
          columnIndex: index,
        },
        isEditing: true,
      });
    });
  };

  private clickGroupOptions = (e: MouseEvent) => {
    const group = this.group;
    if (!group) {
      return;
    }
    const ele = e.currentTarget as HTMLElement;
    popFilterableSimpleMenu(popupTargetFromElement(ele), [
      menu.action({
        name: 'Desagrupar',
        hide: () => group.value == null,
        select: () => {
          group.rows.forEach(id => {
            group.manager.removeFromGroup(id, group.key);
          });
        },
      }),
      menu.action({
        name: 'Eliminar tarjetas',
        select: () => {
          this.view.rowDelete(group.rows);
        },
      }),
    ]);
  };

  private renderGroupHeader = () => {
    if (!this.group) {
      return null;
    }
    return html`
      <div
        style="position: sticky;left: 0;width: max-content;padding: 6px 0;margin-bottom: 4px;display:flex;align-items:center;gap: 12px;max-width: 400px"
      >
        ${GroupTitle(this.group, {
          readonly: this.view.readonly$.value,
          clickAdd: this.clickAddRowInStart,
          clickOps: this.clickGroupOptions,
        })}
      </div>
    `;
  };

  get rows() {
    return this.group?.rows ?? this.view.rows$.value;
  }

  private renderRows(ids: string[]) {
    return html`
      <mobile-table-header
        .renderGroupHeader="${this.renderGroupHeader}"
        .tableViewManager="${this.view}"
      ></mobile-table-header>
      <div class="mobile-affine-table-body">
        ${repeat(
          ids,
          id => id,
          (id, idx) => {
            return html` <mobile-table-row
              data-row-index="${idx}"
              data-row-id="${id}"
              .dataViewEle="${this.dataViewEle}"
              .view="${this.view}"
              .rowId="${id}"
              .rowIndex="${idx}"
            ></mobile-table-row>`;
          }
        )}
      </div>
      ${this.view.readonly$.value
        ? null
        : html` <div
            class="data-view-table-group-add-row dv-hover"
            @click="${this.clickAddRow}"
          >
            <div
              class="data-view-table-group-add-row-button dv-icon-16"
              data-test-id="affine-database-add-row-button"
              role="button"
            >
              ${PlusIcon()}<span style="font-size: 12px">Nuevo registro</span>
            </div>
          </div>`}
      <affine-database-column-stats .view="${this.view}" .group="${this.group}">
      </affine-database-column-stats>
    `;
  }

  override render() {
    return this.renderRows(this.rows);
  }

  @property({ attribute: false })
  accessor dataViewEle!: DataViewRenderer;

  @property({ attribute: false })
  accessor group: GroupData | undefined = undefined;

  @query('.affine-database-block-rows')
  accessor rowsContainer: HTMLElement | null = null;

  @property({ attribute: false })
  accessor view!: TableSingleView;

  @property({ attribute: false })
  accessor viewEle!: DataViewTable;
}

declare global {
  interface HTMLElementTagNameMap {
    'mobile-table-group': MobileTableGroup;
  }
}