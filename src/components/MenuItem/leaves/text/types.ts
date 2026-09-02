import type {ReactElement} from 'react';

/**
 * Props shared by the single-line text leaves of a `MenuItem.Content` — `MenuItem.Title` and
 * `MenuItem.FieldValue`.
 */
type MenuItemTitleTextProps =
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

export type {MenuItemSupportingTextProps, MenuItemTitleTextProps};
