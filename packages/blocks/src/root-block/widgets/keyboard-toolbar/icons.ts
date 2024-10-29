import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
} from '@blocksuite/icons/lit';
import { cssVarV2 } from '@toeverything/theme/v2';
import { html } from 'lit';

import { TOOL_PANEL_ICON_STYLE } from './styles.js';

export function HeadingIcon(i: 1 | 2 | 3 | 4 | 5 | 6) {
  switch (i) {
    case 1:
      return Heading1Icon(TOOL_PANEL_ICON_STYLE);
    case 2:
      return Heading2Icon(TOOL_PANEL_ICON_STYLE);
    case 3:
      return Heading3Icon(TOOL_PANEL_ICON_STYLE);
    case 4:
      return Heading4Icon(TOOL_PANEL_ICON_STYLE);
    case 5:
      return Heading5Icon(TOOL_PANEL_ICON_STYLE);
    case 6:
      return Heading6Icon(TOOL_PANEL_ICON_STYLE);
    default:
      return Heading1Icon(TOOL_PANEL_ICON_STYLE);
  }
}

export const HighLightDuotoneIcon = (color: string) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M5.8291 16.441L7.91757 18.5295L6.57811 19.8689C6.53119 19.9158 6.46406 19.9364 6.3989 19.9239L3.37036 19.3412C3.21285 19.3109 3.15331 19.1168 3.26673 19.0034L5.8291 16.441Z"
      fill="${color}"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M19.0095 3.63759C17.9526 2.58067 16.26 2.516 15.1255 3.48919L7.32135 10.1837C6.35438 11.0132 6.05275 12.3823 6.58163 13.5414L6.73501 13.8775L5.67697 14.9356C5.30169 15.3108 5.30169 15.9193 5.67697 16.2946L8.06379 18.6814C8.43907 19.0567 9.04752 19.0567 9.4228 18.6814L10.4808 17.6234L10.8171 17.7768C11.9761 18.3057 13.3452 18.0041 14.1747 17.0371L20.8692 9.23294C21.8424 8.09846 21.7778 6.40588 20.7208 5.34896L19.0095 3.63759ZM16.1021 4.62769C16.6415 4.16498 17.4463 4.19572 17.9488 4.69825L19.6602 6.40962C20.1627 6.91215 20.1935 7.7169 19.7307 8.25631L14.6424 14.188L10.1704 9.71604L16.1021 4.62769ZM9.02857 10.6955L8.29798 11.3222C7.83822 11.7166 7.6948 12.3676 7.94627 12.9187L8.29785 13.6892C8.4348 13.9893 8.37947 14.3544 8.13372 14.6001L7.11878 15.6151L8.74329 17.2396L9.75812 16.2247C10.004 15.9789 10.3691 15.9236 10.6693 16.0606L11.4398 16.4122C11.9908 16.6636 12.6418 16.5202 13.0362 16.0605L13.6629 15.3299L9.02857 10.6955Z"
      fill="${cssVarV2('icon/primary')}"
    />
  </svg>`;

export const TextColorIcon = (color: string) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${TOOL_PANEL_ICON_STYLE.width}"
    height="${TOOL_PANEL_ICON_STYLE.height}"
    viewBox="0 0 ${TOOL_PANEL_ICON_STYLE.width} ${TOOL_PANEL_ICON_STYLE.height}"
    fill="none"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14.0627 6.16255C14.385 5.30291 15.2068 4.7334 16.1249 4.7334C17.043 4.7334 17.8648 5.30291 18.1872 6.16255L23.7279 20.9378C23.9219 21.455 23.6599 22.0314 23.1427 22.2253C22.6256 22.4192 22.0492 22.1572 21.8553 21.6401L20.2289 17.3031H12.021L10.3946 21.6401C10.2007 22.1572 9.62428 22.4192 9.10716 22.2253C8.59004 22.0314 8.32803 21.455 8.52195 20.9378L14.0627 6.16255ZM12.771 15.3031H19.4789L16.3146 6.8648C16.2849 6.78576 16.2094 6.7334 16.1249 6.7334C16.0405 6.7334 15.965 6.78576 15.9353 6.8648L12.771 15.3031Z"
      fill="${cssVarV2('icon/primary')}"
    />
    <rect
      x="5.45837"
      y="24"
      width="21.3333"
      height="3.33333"
      rx="1"
      fill=${color}
    />
  </svg>`;

export const TextBackgroundDuotoneIcon = (color: string) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${TOOL_PANEL_ICON_STYLE.width}"
    height="${TOOL_PANEL_ICON_STYLE.height}"
    viewBox="0 0 ${TOOL_PANEL_ICON_STYLE.width} ${TOOL_PANEL_ICON_STYLE.height}"
    fill="none"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M4.57507 7.33336C4.57507 5.60287 5.97791 4.20003 7.70841 4.20003H25.0417C26.7722 4.20003 28.1751 5.60287 28.1751 7.33336V24.6667C28.1751 26.3972 26.7722 27.8 25.0417 27.8H7.70841C5.97791 27.8 4.57507 26.3972 4.57507 24.6667V7.33336Z"
      fill="${color}"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M4.57495 7.33333C4.57495 5.60284 5.97779 4.2 7.70828 4.2H25.0416C26.7721 4.2 28.175 5.60284 28.175 7.33333V24.6667C28.175 26.3972 26.7721 27.8 25.0416 27.8H7.70828C5.97779 27.8 4.57495 26.3972 4.57495 24.6667V7.33333ZM7.70828 5.13333C6.49326 5.13333 5.50828 6.1183 5.50828 7.33333V24.6667C5.50828 25.8817 6.49326 26.8667 7.70828 26.8667H25.0416C26.2566 26.8667 27.2416 25.8817 27.2416 24.6667V7.33333C27.2416 6.1183 26.2566 5.13333 25.0416 5.13333H7.70828Z"
      fill="black"
      fill-opacity="0.22"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14.5379 10.0064C14.8251 9.24064 15.5571 8.73332 16.375 8.73332C17.1928 8.73332 17.9249 9.24064 18.2121 10.0064L22.6446 21.8266C22.8386 22.3438 22.5766 22.9202 22.0594 23.1141C21.5423 23.308 20.9659 23.046 20.772 22.5289L19.5196 19.1891H13.2304L11.978 22.5289C11.7841 23.046 11.2076 23.308 10.6905 23.1141C10.1734 22.9202 9.9114 22.3438 10.1053 21.8266L14.5379 10.0064ZM13.9804 17.1891H18.7696L16.375 10.8035L13.9804 17.1891Z"
      fill="${cssVarV2('text/primary')}"
    />
  </svg>`;
