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
import {useRootActions} from './RootContext';
import {useIsAtActiveLevel} from './SubContext';

type ItemSelectEvent = {
    defaultPrevented: boolean;
    preventDefault: () => void;
};

function createSelectEvent(): ItemSelectEvent {
    const event: ItemSelectEvent = {
        defaultPrevented: false,
        preventDefault() {
            event.defaultPrevented = true;
        },
    };
    return event;
}

/** Props PopoverMenu.Item owns directly: the menu-row label, selection callback, and `disabled`. */
type ItemOwnProps = {
    text: string;
    /** Call `event.preventDefault()` to keep the menu open after select. */
    onSelect?: (event: ItemSelectEvent) => void;
    disabled?: boolean;
    pendingAction?: PendingAction;
    /** Override the default `PopoverMenu.Item-${text}` testID. */
    testID?: string;
    /** Optional right-side icon. Renders only when set. */
    rightIcon?: IconAsset;
};

/** Distributive `Omit` that preserves discriminated union narrowing (built-in `Omit` collapses it). */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** Props inherited from MenuItem; PopoverMenu.Item controls these and the rest are forwarded. */
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

type ItemProps = ItemOwnProps & MenuItemForwardProps;

function Item({text, onSelect, disabled = false, pendingAction, testID, rightIcon, iconWidth, iconHeight, ...rest}: ItemProps): React.ReactElement | null {
    const id = useId();
    const ref = useRef<View>(null);
    const {
        state: {focusedId},
    } = useContentState('PopoverMenu.Item');
    const {setIsVisible} = useRootActions('PopoverMenu.Item');
    const {registerItem, unregisterItem, setFocusedId} = useContentActions('PopoverMenu.Item');
    const isAtActiveLevel = useIsAtActiveLevel('PopoverMenu.Item');

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

    // Latest handler mirrored so the registry's onActivate stays stable across renders.
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
                onPress={handleActivate}
                onFocus={() => setFocusedId(id)}
                focused={focusedId === id}
                shouldCheckActionAllowedOnPress={false}
                role={CONST.ROLE.BUTTON}
                pressableTestID={testID ?? `PopoverMenu.Item-${text}`}
            />
        </OfflineWithFeedback>
    );
}

Item.displayName = 'PopoverMenu.Item';

export default Item;
export type {ItemProps, ItemSelectEvent};
