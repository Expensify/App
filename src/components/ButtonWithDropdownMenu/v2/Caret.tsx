import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import mergeRefs from '@libs/mergeRefs';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {useButtonWithDropdownMenuRootActions, useButtonWithDropdownMenuRootState} from './Context';
import {useAssertOutsideMenu} from './MenuContext';
import type {CaretProps} from './types';
import useButtonSizeFlags from './useButtonSizeFlags';

function Caret({ref, accessibilityLabel, sentryLabel}: CaretProps): React.ReactElement {
    useAssertOutsideMenu('ButtonWithDropdownMenuV2.Caret');
    const {
        state: {isMenuVisible},
        meta: {dropdownAnchor, success, isDisabled, shouldStayNormalOnDisable, enterKeyEventListenerPriority, buttonSize, isCompactTrigger, sentryLabel: rootSentryLabel},
    } = useButtonWithDropdownMenuRootState('ButtonWithDropdownMenuV2.Caret');
    const {setIsMenuVisible} = useButtonWithDropdownMenuRootActions('ButtonWithDropdownMenuV2.Caret');
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const {isButtonSizeLarge, isButtonSizeSmall, isButtonSizeExtraSmall, innerStyleDropButton} = useButtonSizeFlags(buttonSize);

    const mergedRef = mergeRefs<View>(ref, dropdownAnchor);

    return (
        <Button
            ref={mergedRef}
            success={success}
            isDisabled={isDisabled}
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{expanded: isMenuVisible}}
            shouldStayNormalOnDisable={shouldStayNormalOnDisable}
            style={[styles.pl0]}
            onPress={() => setIsMenuVisible((current) => !current)}
            shouldRemoveLeftBorderRadius
            extraSmall={isButtonSizeExtraSmall}
            large={isButtonSizeLarge}
            medium={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            small={isButtonSizeSmall}
            innerStyles={[styles.dropDownButtonCartIconContainerPadding, innerStyleDropButton, isButtonSizeSmall && styles.dropDownButtonCartIcon]}
            enterKeyEventListenerPriority={enterKeyEventListenerPriority}
            sentryLabel={sentryLabel ?? rootSentryLabel}
        >
            <View style={[styles.dropDownButtonCartIconView, innerStyleDropButton]}>
                <View style={[success ? styles.buttonSuccessDivider : styles.buttonDivider]} />
                <View
                    style={[
                        isButtonSizeLarge && styles.dropDownLargeButtonArrowContain,
                        isButtonSizeSmall && isCompactTrigger ? styles.dropDownSmallButtonArrowContain : styles.dropDownMediumButtonArrowContain,
                        isButtonSizeExtraSmall && styles.dropDownSmallButtonArrowContain,
                    ]}
                >
                    <Icon
                        medium={isButtonSizeLarge}
                        small={!isButtonSizeLarge && !isCompactTrigger}
                        inline={isCompactTrigger}
                        width={isCompactTrigger ? variables.iconSizeExtraSmall : undefined}
                        height={isCompactTrigger ? variables.iconSizeExtraSmall : undefined}
                        src={icons.DownArrow}
                        additionalStyles={[...(isCompactTrigger ? [styles.pRelative, styles.t0] : []), isMenuVisible ? styles.flipUpsideDown : undefined]}
                        fill={success ? theme.buttonSuccessText : theme.buttonIcon}
                        testID="dropdown-arrow-icon"
                    />
                </View>
            </View>
        </Button>
    );
}

Caret.displayName = 'ButtonWithDropdownMenuV2.Caret';

export default Caret;
