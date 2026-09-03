import type {ReactElement} from 'react';

/**
 * Props shared by the prominent text leaves of a `MenuItem.Content` — `MenuItem.Title` and
 * `MenuItem.FieldValue`. Prominence is about emphasis, not position: a field row puts its
 * `MenuItem.FieldValue` on the bottom line.
 */
type MenuItemPrimaryTextProps =
    | {
          /** Text to render */
          children: string | number;

          accessibilityLabel?: never;
      }
    | {
          /** Element to render in place of plain text, e.g. a `DisplayNames` with per-name tooltips */
          children: ReactElement;

          accessibilityLabel: string;
      };

/**
 * Props shared by the supporting text leaves of a `MenuItem.Content` — `MenuItem.Description`,
 * `MenuItem.FieldName` and `MenuItem.FieldNamePlaceholder`.
 */
type MenuItemSupportingTextProps = {
    /** Text to render */
    children: string | number;

    /** Maximum number of lines to render before the text is truncated */
    numberOfLines?: number;
};

export type {MenuItemSupportingTextProps, MenuItemPrimaryTextProps};
