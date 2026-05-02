import type {MenuItemProps} from '@components/MenuItem';

/** Preserves the discriminated MenuItemProps union — built-in `Omit` collapses it. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** Props forwarded from selectable rows (Item / CheckmarkItem) to the underlying MenuItem. */
type MenuItemForwardProps = DistributiveOmit<
    MenuItemProps,
    | 'title'
    | 'onPress'
    | 'interactive'
    | 'role'
    | 'shouldCheckActionAllowedOnPress'
    | 'pressableTestID'
    | 'focused'
    | 'onFocus'
    | 'iconRight'
    | 'shouldShowRightIcon'
    | 'shouldShowSelectedItemCheck'
    | 'isSelected'
    | 'disabled'
    | 'pendingAction'
    | 'ref'
>;

/** Props forwarded from Label to MenuItem (Label overrides fewer keys than selectable rows). */
type LabelMenuItemForwardProps = DistributiveOmit<
    MenuItemProps,
    'title' | 'onPress' | 'interactive' | 'role' | 'pressableTestID' | 'focused' | 'onFocus' | 'shouldCheckActionAllowedOnPress' | 'ref'
>;

export type {DistributiveOmit, MenuItemForwardProps, LabelMenuItemForwardProps};
