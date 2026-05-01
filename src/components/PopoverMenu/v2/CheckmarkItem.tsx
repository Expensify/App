import React, {useId, useLayoutEffect, useRef} from 'react';
import type {View} from 'react-native';
import FocusableMenuItem from '@components/FocusableMenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import {useContentActions, useContentState} from './ContentContext';
import type {ItemSelectEvent} from './Item';
import {useRootActions} from './RootContext';
import {useIsAtActiveLevel} from './SubContext';

function createSelectEvent(): ItemSelectEvent {
    const event: ItemSelectEvent = {
        defaultPrevented: false,
        preventDefault() {
            event.defaultPrevented = true;
        },
    };
    return event;
}

/** Preserves the discriminated MenuItemProps union — built-in `Omit` collapses it. */
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

type CheckmarkItemOwnProps = {
    text: string;
    /** Renders the check icon when true. */
    isSelected?: boolean;
    /** Call `event.preventDefault()` to keep the menu open after select. */
    onSelect?: (event: ItemSelectEvent) => void;
    disabled?: boolean;
    pendingAction?: PendingAction;
    /** Defaults to `PopoverMenu.CheckmarkItem-${text}`. */
    testID?: string;
    /** When set, replaces the check icon. */
    rightIcon?: IconAsset;
};

type CheckmarkItemProps = CheckmarkItemOwnProps & MenuItemForwardProps;

/** Selectable menu row that renders a check when `isSelected` — radix's `DropdownMenu.CheckboxItem` analogue. */
function CheckmarkItem({
    text,
    isSelected = false,
    onSelect,
    disabled = false,
    pendingAction,
    testID,
    rightIcon,
    iconWidth,
    iconHeight,
    ...rest
}: CheckmarkItemProps): React.ReactElement | null {
    const id = useId();
    const ref = useRef<View>(null);
    const {
        state: {focusedId},
    } = useContentState('PopoverMenu.CheckmarkItem');
    const {setIsVisible} = useRootActions('PopoverMenu.CheckmarkItem');
    const {registerItem, unregisterItem, setFocusedId} = useContentActions('PopoverMenu.CheckmarkItem');
    const isAtActiveLevel = useIsAtActiveLevel('PopoverMenu.CheckmarkItem');

    const handleActivate = () => {
        if (disabled) {
            return;
        }
        const selectEvent = createSelectEvent();
        onSelect?.(selectEvent);
        if (selectEvent.defaultPrevented) {
            return;
        }
        setIsVisible(false);
    };

    // Mirrored so the registry's `onActivate` stays stable across renders.
    const handleActivateRef = useRef(handleActivate);
    useLayoutEffect(() => {
        handleActivateRef.current = handleActivate;
    });

    useLayoutEffect(() => {
        if (!isAtActiveLevel) {
            return;
        }
        registerItem(id, {
            ref,
            isDisabled: disabled,
            onActivate: () => handleActivateRef.current(),
        });
        return () => unregisterItem(id);
    }, [isAtActiveLevel, id, registerItem, unregisterItem, disabled]);

    if (!isAtActiveLevel) {
        return null;
    }

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <FocusableMenuItem
                // eslint-disable-next-line react/jsx-props-no-spreading -- forwards MenuItemProps' discriminated union; matches FocusableMenuItem
                {...rest}
                ref={ref}
                title={text}
                iconWidth={iconWidth ?? variables.iconSizeNormal}
                iconHeight={iconHeight ?? variables.iconSizeNormal}
                iconRight={rightIcon}
                shouldShowRightIcon={!!rightIcon}
                disabled={disabled}
                interactive
                isSelected={isSelected}
                // MenuItem renders the check and right icon as independent slots — suppress the check when caller supplies a custom right icon.
                shouldShowSelectedItemCheck={!rightIcon}
                onPress={handleActivate}
                onFocus={() => setFocusedId(id)}
                focused={focusedId === id}
                shouldCheckActionAllowedOnPress={false}
                role={CONST.ROLE.BUTTON}
                pressableTestID={testID ?? `PopoverMenu.CheckmarkItem-${text}`}
            />
        </OfflineWithFeedback>
    );
}

CheckmarkItem.displayName = 'PopoverMenu.CheckmarkItem';

export default CheckmarkItem;
export type {CheckmarkItemProps};
