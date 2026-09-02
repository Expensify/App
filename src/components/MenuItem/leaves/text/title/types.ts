import type {ReactElement} from 'react';

/** Props shared by every title leaf of a `MenuItem.Content` */
type MenuItemTitleProps =
    | {
          /** Text to render as the title */
          children: string | number;

          accessibilityLabel?: never;
      }
    | {
          /** Element to render in place of plain text, e.g. a `DisplayNames` with per-name tooltips */
          children: ReactElement;

          accessibilityLabel: string;
      };

export default MenuItemTitleProps;
