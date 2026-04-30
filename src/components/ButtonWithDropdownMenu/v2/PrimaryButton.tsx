import React from 'react';
import Button from '@components/Button';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useAssertOutsideMenu} from './MenuRegistryActionsContext';
import {useButtonWithDropdownMenuRootState} from './RootContext';
import type {PrimaryButtonProps} from './types';
import useButtonSizeFlags, {TEXT_COMPACT_THRESHOLD} from './useButtonSizeFlags';

function PrimaryButton({
    ref,
    children,
    onPress,
    icon,
    isDisabled: primaryIsDisabled,
    shouldStayNormalOnDisable = false,
    pressOnEnter = false,
    useKeyboardShortcuts = false,
    enterKeyEventListenerPriority = 0,
    sentryLabel,
}: PrimaryButtonProps): React.ReactElement {
    useAssertOutsideMenu('ButtonWithDropdownMenuV2.PrimaryButton');
    const {
        meta: {success, isDisabled: rootIsDisabled, isLoading, buttonSize, isCompactTrigger, brickRoadIndicator, sentryLabel: rootSentryLabel, testID},
    } = useButtonWithDropdownMenuRootState('ButtonWithDropdownMenuV2.PrimaryButton');
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const {isButtonSizeLarge, isButtonSizeSmall, isButtonSizeExtraSmall, innerStyleDropButton} = useButtonSizeFlags(buttonSize);

    const hasError = brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    const isTextTooLong = typeof children === 'string' && children.length > TEXT_COMPACT_THRESHOLD;
    const isPrimaryDisabled = rootIsDisabled || !!primaryIsDisabled;

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER,
        (event) => {
            onPress(event);
        },
        {
            captureOnInputs: true,
            shouldBubble: false,
            isActive: useKeyboardShortcuts && !isPrimaryDisabled && !isLoading,
        },
    );

    const isStringLabel = typeof children === 'string';

    return (
        <Button
            success={success}
            pressOnEnter={pressOnEnter}
            ref={ref}
            onPress={onPress}
            text={isStringLabel ? children : ''}
            isDisabled={isPrimaryDisabled}
            shouldStayNormalOnDisable={shouldStayNormalOnDisable}
            isLoading={isLoading}
            shouldRemoveRightBorderRadius
            style={[styles.flex1, styles.pr0]}
            extraSmall={isButtonSizeExtraSmall}
            large={isButtonSizeLarge}
            medium={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            small={isButtonSizeSmall}
            innerStyles={[innerStyleDropButton, isTextTooLong && isCompactTrigger && {...styles.pl2, ...styles.pr1}]}
            enterKeyEventListenerPriority={enterKeyEventListenerPriority}
            testID={testID}
            textStyles={[isTextTooLong && isCompactTrigger ? {...styles.textExtraSmall, ...styles.textBold} : {}]}
            icon={hasError ? icons.DotIndicator : icon}
            iconFill={hasError ? theme.danger : undefined}
            iconHoverFill={hasError ? theme.danger : undefined}
            sentryLabel={sentryLabel ?? rootSentryLabel}
            // eslint-disable-next-line react/jsx-props-no-spreading -- conditional spread keeps `children` absent for string labels; Button presence-checks the prop and would short-circuit otherwise.
            {...(isStringLabel ? {} : {children})}
        />
    );
}

PrimaryButton.displayName = 'ButtonWithDropdownMenuV2.PrimaryButton';

export default PrimaryButton;
