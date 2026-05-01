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

/** Distributive `Omit` that preserves discriminated union narrowing. */
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
    /** Whether this row is the currently selected option (renders the check icon). */
    isSelected?: boolean;
    /** Call `event.preventDefault()` to keep the menu open after select. */
    onSelect?: (event: ItemSelectEvent) => void;
    disabled?: boolean;
    pendingAction?: PendingAction;
    /** Override the default `PopoverMenu.CheckmarkItem-${text}` testID. */
    testID?: string;
    /** Optional right-side icon (replaces the check). Renders only when set. */
    rightIcon?: IconAsset;
};

type CheckmarkItemProps = CheckmarkItemOwnProps & MenuItemForwardProps;

/**
 * Selectable menu row that renders a check icon when `isSelected`. Mirrors radix's
 * `DropdownMenu.CheckboxItem`. Use for "single selection" lists (currency picker, language
 * picker, etc.). For plain rows that don't track selection, use `<PopoverMenu.Item>`.
 */
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
                // eslint-disable-next-line react/jsx-props-no-spreading -- forwards the discriminated MenuItemProps union; same pattern as FocusableMenuItem itself
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
                shouldShowSelectedItemCheck
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
