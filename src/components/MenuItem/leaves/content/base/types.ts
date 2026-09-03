import type {MenuItemLabelSlot} from '@components/MenuItem/MenuItemAccessibilityContext';

import type {ReactElement} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

/** Props of the full-contrast leaves */
type MenuItemPrimaryTextProps =
    | {
          children: string | number;

          accessibilityLabel?: never;
      }
    | {
          /** For content plain text can't express, e.g. `DisplayNames` with per-name tooltips */
          children: ReactElement;

          /** Required here — the row builds its label from strings and can't read one out of an element */
          accessibilityLabel: string;
      };

/** Props of the muted leaves */
type MenuItemSupportingTextProps = {
    children: string | number;

    /** Defaults to 2 — supporting text wraps, unlike primary text, which is always one line */
    numberOfLines?: number;
};

/** Props shared by MenuItem's content text */
type BaseMenuItemTextProps = {
    /** Which line of the row this leaf occupies, so the row announces its text in visual order */
    slot: MenuItemLabelSlot;

    /** Typography layered on top of the shared base — each leaf brings its own size and line height */
    style?: StyleProp<TextStyle>;
};

export type {MenuItemSupportingTextProps, MenuItemPrimaryTextProps, BaseMenuItemTextProps};
