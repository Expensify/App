import React, {forwardRef} from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import {Video, ResizeMode} from 'expo-av';
import Slider from '../AvatarCropModal/Slider';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import CONST from '../../CONST';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    src: PropTypes.any.isRequired,

    onPress: PropTypes.func,

    fill: PropTypes.string,

    accessibilityLabel: PropTypes.string.isRequired,

    // eslint-disable-next-line react/forbid-prop-types,
    style: PropTypes.object,
};

const defaultProps = {
    fill: 'white',
    onPress: () => {},
    style: {},
};

function IconButton({src, fill, onPress, style, accessibilityLabel}) {
    return (
        <PressableWithoutFeedback
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            onPress={onPress}
            style={[{padding: 5}, style]}
        >
            <Icon
                src={src}
                fill={fill}
            />
        </PressableWithoutFeedback>
    );
}

IconButton.propTypes = propTypes;
IconButton.defaultProps = defaultProps;
IconButton.displayName = 'IconButton';

export default IconButton;
