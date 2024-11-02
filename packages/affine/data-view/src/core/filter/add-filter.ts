import type { ReadonlySignal } from '@preact/signals-core';

import {
  menu,
  popMenu,
  type PopupTarget,
} from '@blocksuite/affine-components/context-menu';
import { AddCursorIcon } from '@blocksuite/icons/lit';

import type { Variable } from '../expression/index.js';
import type { Filter } from './types.js';

import { renderUniLit } from '../utils/index.js';
import { firstFilterByRef, firstFilterInGroup } from './utils.js';

export const popCreateFilter = (
  target: PopupTarget,
  props: {
    vars: ReadonlySignal<Variable[]>;
    onSelect: (filter: Filter) => void;
    onClose?: () => void;
    onBack?: () => void;
  }
) => {
  popMenu(target, {
    options: {
      onClose: props.onClose,
      title: {
        onBack: props.onBack,
        text: 'Nuevo filtro',
      },
      items: [
        ...props.vars.value.map(v =>
          menu.action({
            name: v.name,
            prefix: renderUniLit(v.icon, {}),
            select: () => {
              props.onSelect(
                firstFilterByRef(props.vars.value, {
                  type: 'ref',
                  name: v.id,
                })
              );
            },
          })
        ),
        menu.group({
          name: '',
          items: [
            menu.action({
              name: 'Agregar grupo de filtros',
              prefix: AddCursorIcon(),
              select: () => {
                props.onSelect(firstFilterInGroup(props.vars.value));
              },
            }),
          ],
        }),
      ],
    },
  });
};