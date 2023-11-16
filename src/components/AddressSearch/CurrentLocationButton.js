import PropTypes from 'prop-types';
import React from 'react';
import {Text} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useLocalize from '@hooks/useLocalize';
import getButtonState from '@libs/getButtonState';
import colors from '@styles/colors';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** Callback that runs when location button is clicked */
    onPress: PropTypes.func,

    /** Boolean to indicate if the button is clickable */
    isDisabled: PropTypes.bool,
};

const defaultProps = {
    isDisabled: false,
    onPress: () => {},
};

function CurrentLocationButton({onPress, isDisabled}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PressableWithFeedback
            style={[styles.flexRow, styles.pv4, styles.ph3, isDisabled && styles.buttonOpacityDisabled]}
            hoverStyle={StyleUtils.getButtonBackgroundColorStyle(getButtonState(true), true)}
            onPress={onPress}
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
CurrentLocationButton.propTypes = propTypes;
CurrentLocationButton.defaultProps = defaultProps;

export default CurrentLocationButton;
