import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
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
    ref,
    children,
    onOpenChange,
    success = true,
    isLoading = false,
    isDisabled = false,
    shouldStayNormalOnDisable = false,
    pressOnEnter = false,
    useKeyboardShortcuts = false,
    enterKeyEventListenerPriority = 0,
    buttonSize = CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    triggerLayout = 'default',
    wrapperStyle,
    testID,
    brickRoadIndicator,
    sentryLabel,
}: ButtonWithDropdownMenuV2Props): React.ReactElement {
    const styles = useThemeStyles();
    const [isMenuVisible, setIsMenuVisibleState] = useState(false);
    const dropdownAnchor = useRef<View | null>(null);

    // Notify via effect so the state updater stays pure (no StrictMode double-fire).
    const previousIsMenuVisibleRef = useRef(isMenuVisible);
    useEffect(() => {
        if (previousIsMenuVisibleRef.current === isMenuVisible) {
            return;
        }
        previousIsMenuVisibleRef.current = isMenuVisible;
        onOpenChange?.(isMenuVisible);
    }, [isMenuVisible, onOpenChange]);

    const [actions] = useState<ButtonWithDropdownMenuRootActionsValue>(() => ({
        setIsMenuVisible: setIsMenuVisibleState,
    }));

    useImperativeHandle(ref, () => ({setIsMenuVisible: actions.setIsMenuVisible}), [actions]);

    const stateValue = {
        state: {isMenuVisible},
        meta: {
            dropdownAnchor,
            success,
            isDisabled,
            isLoading,
            shouldStayNormalOnDisable,
            pressOnEnter,
            useKeyboardShortcuts,
            enterKeyEventListenerPriority,
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
export type {ButtonWithDropdownMenuV2Props, ButtonWithDropdownMenuV2Ref, DropdownOptionV2Props, DropdownSubmenuV2Props, MenuProps} from './types';
