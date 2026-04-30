import React from 'react';
import type {View} from 'react-native';
import Button from '@components/Button';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import mergeRefs from '@libs/mergeRefs';
import CONST from '@src/CONST';
import {useAssertOutsideMenu} from './MenuRegistryActionsContext';
import {useButtonWithDropdownMenuRootActions, useButtonWithDropdownMenuRootState} from './RootContext';
import type {TriggerProps} from './types';
import useButtonSizeFlags, {TEXT_COMPACT_THRESHOLD} from './useButtonSizeFlags';

function Trigger({
    ref,
    text,
    children,
    icon,
    style,
    disabledStyle,
    shouldStayNormalOnDisable = false,
    pressOnEnter = false,
    useKeyboardShortcuts = false,
    enterKeyEventListenerPriority = 0,
    sentryLabel,
}: TriggerProps): React.ReactElement {
    useAssertOutsideMenu('ButtonWithDropdownMenuV2.Trigger');
    const {
        state: {isMenuVisible},
        meta: {dropdownAnchor, success, isDisabled, isLoading, buttonSize, isCompactTrigger, brickRoadIndicator, sentryLabel: rootSentryLabel, testID},
    } = useButtonWithDropdownMenuRootState('ButtonWithDropdownMenuV2.Trigger');
    const {setIsMenuVisible} = useButtonWithDropdownMenuRootActions('ButtonWithDropdownMenuV2.Trigger');
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'DotIndicator']);
    const {isButtonSizeLarge, isButtonSizeSmall, isButtonSizeExtraSmall, innerStyleDropButton} = useButtonSizeFlags(buttonSize);

    const hasError = brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    const isTextTooLong = typeof text === 'string' && text.length > TEXT_COMPACT_THRESHOLD;

    const mergedRef = mergeRefs<View>(ref, dropdownAnchor);

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER,
        () => {
            setIsMenuVisible((current) => !current);
        },
        {
            captureOnInputs: true,
            shouldBubble: false,
            isActive: useKeyboardShortcuts && !isDisabled && !isLoading,
        },
    );

    return (
        <Button
            success={success}
            pressOnEnter={pressOnEnter}
            ref={mergedRef}
            onPress={() => setIsMenuVisible((current) => !current)}
            text={text ?? ''}
            accessibilityState={{expanded: isMenuVisible}}
            isDisabled={isDisabled}
            shouldStayNormalOnDisable={shouldStayNormalOnDisable}
            isLoading={isLoading}
            style={[styles.w100, style]}
            disabledStyle={disabledStyle}
            extraSmall={isButtonSizeExtraSmall}
            large={isButtonSizeLarge}
            medium={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            small={isButtonSizeSmall}
            innerStyles={[innerStyleDropButton, styles.dropDownButtonCartIconView, isTextTooLong && isCompactTrigger && {...styles.pl2, ...styles.pr1}]}
            enterKeyEventListenerPriority={enterKeyEventListenerPriority}
            iconRight={icons.DownArrow}
            iconRightStyles={isMenuVisible ? styles.flipUpsideDown : undefined}
            shouldShowRightIcon={!isLoading}
            testID={testID}
            textStyles={[isTextTooLong && isCompactTrigger ? {...styles.textExtraSmall, ...styles.textBold} : {}]}
            icon={hasError ? icons.DotIndicator : icon}
            iconFill={hasError ? theme.danger : undefined}
            iconHoverFill={hasError ? theme.danger : undefined}
            iconRightFill={hasError ? theme.buttonIcon : undefined}
            iconRightHoverFill={hasError ? theme.buttonIcon : undefined}
            sentryLabel={sentryLabel ?? rootSentryLabel}
            // eslint-disable-next-line react/jsx-props-no-spreading -- conditional spread keeps `children` absent when caller supplied no JSX; Button presence-checks the prop and would short-circuit otherwise.
            {...(children !== undefined ? {children} : {})}
        />
    );
}

Trigger.displayName = 'ButtonWithDropdownMenuV2.Trigger';

export default Trigger;
