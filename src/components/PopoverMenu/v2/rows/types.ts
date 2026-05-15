import type {MenuItemProps} from '@components/MenuItem';

/** Built-in `Omit` collapses the discriminated `MenuItemProps` union. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

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
    | 'isSelected'
    | 'disabled'
    | 'pendingAction'
    | 'ref'
>;

type LabelMenuItemForwardProps = DistributiveOmit<
    MenuItemProps,
    // Same exclusions as `MenuItemForwardProps` plus a few that only make sense on interactive rows.
    | 'title'
    | 'onPress'
    | 'interactive'
    | 'role'
    | 'pressableTestID'
    | 'focused'
    | 'onFocus'
    | 'shouldCheckActionAllowedOnPress'
    | 'ref'
    | 'iconRight'
    | 'shouldShowRightIcon'
    | 'isSelected'
    | 'disabled'
    | 'pendingAction'
>;

export type {DistributiveOmit, MenuItemForwardProps, LabelMenuItemForwardProps};
