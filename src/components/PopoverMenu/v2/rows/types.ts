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
    | 'shouldShowSelectedItemCheck'
    | 'isSelected'
    | 'disabled'
    | 'pendingAction'
    | 'ref'
>;

type LabelMenuItemForwardProps = DistributiveOmit<
    MenuItemProps,
    'title' | 'onPress' | 'interactive' | 'role' | 'pressableTestID' | 'focused' | 'onFocus' | 'shouldCheckActionAllowedOnPress' | 'ref'
>;

export type {DistributiveOmit, MenuItemForwardProps, LabelMenuItemForwardProps};
