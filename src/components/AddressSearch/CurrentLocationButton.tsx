import React, {useImperativeHandle, useRef, useState} from 'react';
import type {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import colors from '@styles/theme/colors';
import type {CurrentLocationButtonProps} from './types';

type CurrentLocationButtonHandle = {
    isFocused: () => void;
    focus: () => void;
    blur: () => void;
    press: () => void;
};
function CurrentLocationButton({onPress, isDisabled = false, innerRef = () => {}}: CurrentLocationButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [isFocused, setIsFocused] = useState(false);
    const buttonRef = useRef<View | HTMLDivElement>(null);
    useImperativeHandle(innerRef, () => ({
        isFocused() {
            return isFocused;
        },
        focus() {
            if (!buttonRef.current) {
                return;
            }
            setIsFocused(true);
        },
        blur() {
            setIsFocused(false);
        },
        press() {
            onPress?.();
        },
    }));
    return (
        <PressableWithFeedback
            style={[styles.flexRow, styles.pv4, styles.ph3, isDisabled && styles.buttonOpacityDisabled, StyleUtils.getBackgroundAndBorderStyle(isFocused ? theme.border : theme.appBG)]}
            hoverStyle={StyleUtils.getButtonBackgroundColorStyle(getButtonState(true), true)}
            onPress={() => onPress?.()}
            accessibilityLabel={translate('location.useCurrent')}
            disabled={isDisabled}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            ref={buttonRef}
        >
            <Icon
                src={Expensicons.Location}
                fill={colors.green}
            />
            <Text style={[styles.textLabel, styles.mh2, isDisabled && styles.userSelectNone]}>{translate('location.useCurrent')}</Text>
        </PressableWithFeedback>
    );
}

CurrentLocationButton.displayName = 'CurrentLocationButton';
export type {CurrentLocationButtonHandle};
export default CurrentLocationButton;
