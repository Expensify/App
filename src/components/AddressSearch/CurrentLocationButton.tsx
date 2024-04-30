import React, {useRef} from 'react';
import type {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import colors from '@styles/theme/colors';
import type {CurrentLocationButtonProps} from './types';

function CurrentLocationButton({onPress, isFocused}: CurrentLocationButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const buttonRef = useRef<View | HTMLDivElement>(null);
    const {isOffline} = useNetwork();
    return (
        <PressableWithFeedback
            style={[styles.flexRow, styles.pv4, styles.ph3, isOffline && styles.buttonOpacityDisabled, StyleUtils.getBackgroundAndBorderStyle(isFocused ? theme.border : theme.appBG)]}
            hoverStyle={StyleUtils.getButtonBackgroundColorStyle(getButtonState(true), true)}
            onPress={onPress}
            accessibilityLabel={translate('location.useCurrent')}
            disabled={isOffline}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            ref={buttonRef}
        >
            <Icon
                src={Expensicons.Location}
                fill={colors.green}
            />
            <Text style={[styles.textLabel, styles.mh2, isOffline && styles.userSelectNone]}>{translate('location.useCurrent')}</Text>
        </PressableWithFeedback>
    );
}

CurrentLocationButton.displayName = 'CurrentLocationButton';

export default CurrentLocationButton;
