import React from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import colors from '@styles/theme/colors';
import type {CurrentLocationButtonProps} from './types';

function CurrentLocationButton({onPress, isDisabled = false}: CurrentLocationButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    return (
        <PressableWithFeedback
            style={[styles.flexRow, styles.pv4, styles.ph3, isDisabled && styles.buttonOpacityDisabled]}
            hoverStyle={StyleUtils.getButtonBackgroundColorStyle(getButtonState(true), true)}
            onPress={() => onPress?.()}
            accessibilityLabel={translate('location.useCurrent')}
            disabled={isDisabled}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
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

export default CurrentLocationButton;
