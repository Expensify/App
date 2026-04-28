import React from 'react';
import Button from '@components/Button';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useButtonWithDropdownMenuRootState} from './Context';
import {useAssertOutsideMenu} from './MenuContext';
import type {PrimaryButtonProps} from './types';

function PrimaryButton({ref, children, onPress, icon, isDisabled: primaryIsDisabled, sentryLabel}: PrimaryButtonProps): React.ReactElement {
    useAssertOutsideMenu('ButtonWithDropdownMenuV2.PrimaryButton');
    const {
        meta: {
            success,
            isDisabled: rootIsDisabled,
            isLoading,
            shouldStayNormalOnDisable,
            pressOnEnter,
            useKeyboardShortcuts,
            enterKeyEventListenerPriority,
            buttonSize,
            isCompactTrigger,
            brickRoadIndicator,
            sentryLabel: rootSentryLabel,
            testID,
        },
    } = useButtonWithDropdownMenuRootState('ButtonWithDropdownMenuV2.PrimaryButton');
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    const isButtonSizeLarge = buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE;
    const isButtonSizeSmall = buttonSize === CONST.DROPDOWN_BUTTON_SIZE.SMALL;
    const isButtonSizeExtraSmall = buttonSize === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL;
    const hasError = brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    const innerStyleDropButton = StyleUtils.getDropDownButtonHeight(buttonSize);
    const isTextTooLong = typeof children === 'string' && children.length > 6;
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
