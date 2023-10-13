import PropTypes from 'prop-types';
import React from 'react';
import {Text} from 'react-native';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import getButtonState from '../../libs/getButtonState';
import * as StyleUtils from '../../styles/StyleUtils';

const propTypes = {
    /** Callback that runs when location button is clicked */
    onPress: PropTypes.func,

    /** Boolean to indicate if the button is clickable */
    isDisabled: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDisabled: false,
    onPress: () => {},
};

function CurrentLocationButton({onPress, isDisabled, translate}) {
    return (
        <PressableWithFeedback
            style={[styles.flexRow, styles.pv4, styles.ph3, isDisabled && styles.buttonOpacityDisabled]}
            hoverStyle={StyleUtils.getButtonBackgroundColorStyle(getButtonState(true), true)}
            onPress={onPress}
            accessibilityLabel={translate('location.useCurrent')}
            disabled={isDisabled}
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

// This components gets used inside <Form/>, we are using an HOC (withLocalize) as function components with
// hooks give hook errors when nested inside <Form/>.
export default withLocalize(CurrentLocationButton);
