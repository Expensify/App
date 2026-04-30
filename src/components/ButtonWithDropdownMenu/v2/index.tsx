import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Caret from './Caret';
import Menu from './Menu';
import Option from './Option';
import PrimaryButton from './PrimaryButton';
import {ButtonWithDropdownMenuRootActionsContext, ButtonWithDropdownMenuRootStateContext} from './RootContext';
import type {ButtonWithDropdownMenuRootActionsValue, ButtonWithDropdownMenuRootStateValue} from './RootContext';
import Submenu from './Submenu';
import Trigger from './Trigger';
import type {ButtonWithDropdownMenuV2Props} from './types';

function ButtonWithDropdownMenuV2({
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    success = true,
    isLoading = false,
    isDisabled = false,
    buttonSize = CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    triggerLayout = 'default',
    wrapperStyle,
    testID,
    brickRoadIndicator,
    sentryLabel,
}: ButtonWithDropdownMenuV2Props): React.ReactElement {
    const styles = useThemeStyles();
    const dropdownAnchor = useRef<View | null>(null);

    const isControlled = open !== undefined;
    const [internalOpen, setInternalOpen] = useState(isControlled ? open : defaultOpen);
    const isMenuVisible = isControlled ? open : internalOpen;

    // Mirror latest values so the lazy-init setter below stays referentially stable.
    const isControlledRef = useRef(isControlled);
    const isMenuVisibleRef = useRef(isMenuVisible);
    const onOpenChangeRef = useRef(onOpenChange);
    useLayoutEffect(() => {
        isControlledRef.current = isControlled;
        isMenuVisibleRef.current = isMenuVisible;
        onOpenChangeRef.current = onOpenChange;
    });

    // Skip notify in controlled mode — the parent already drove the change via `open`.
    const previousIsMenuVisibleRef = useRef(isMenuVisible);
    useEffect(() => {
        if (previousIsMenuVisibleRef.current === isMenuVisible) {
            return;
        }
        previousIsMenuVisibleRef.current = isMenuVisible;
        if (isControlled) {
            return;
        }
        onOpenChange?.(isMenuVisible);
    }, [isMenuVisible, isControlled, onOpenChange]);

    const [actions] = useState<ButtonWithDropdownMenuRootActionsValue>(() => ({
        setIsMenuVisible: (next) => {
            if (isControlledRef.current) {
                const current = isMenuVisibleRef.current;
                const resolved = typeof next === 'function' ? next(current) : next;
                if (resolved !== current) {
                    onOpenChangeRef.current?.(resolved);
                }
                return;
            }
            setInternalOpen(next);
        },
    }));

    const stateValue = {
        state: {isMenuVisible},
        meta: {
            dropdownAnchor,
            success,
            isDisabled,
            isLoading,
            buttonSize,
            isCompactTrigger: triggerLayout === 'compact',
            brickRoadIndicator,
            sentryLabel,
            testID,
        },
    } satisfies ButtonWithDropdownMenuRootStateValue;

    return (
        <ButtonWithDropdownMenuRootStateContext.Provider value={stateValue}>
            <ButtonWithDropdownMenuRootActionsContext.Provider value={actions}>
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, wrapperStyle]}>{children}</View>
            </ButtonWithDropdownMenuRootActionsContext.Provider>
        </ButtonWithDropdownMenuRootStateContext.Provider>
    );
}

const ButtonWithDropdownMenuV2WithStatics = Object.assign(ButtonWithDropdownMenuV2, {
    PrimaryButton,
    Caret,
    Trigger,
    Menu,
    Option,
    Submenu,
});

export default ButtonWithDropdownMenuV2WithStatics;
export type {ButtonWithDropdownMenuV2Props, DropdownOptionV2Props, DropdownSubmenuV2Props, MenuProps} from './types';
