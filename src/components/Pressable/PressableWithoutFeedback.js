import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../../styles/styles';
import GenericPressable from './GenericPressable';
import GenericPressableProps from './GenericPressable/PropTypes';

const omittedProps = [
    'wrapperStyle',
    'pressStyle',
    'hoverStyle',
    'focusStyle',
    'activeStyle',
    'disabledStyle',
    'screenReaderActiveStyle',
    'shouldUseHapticsOnPress',
    'shouldUseHapticsOnLongPress',
];

const PressableWithoutFeedback = React.forwardRef((props, ref) => {
    const propsWithoutStyling = _.omit(props, omittedProps);
    return (
        <View style={[props.disabled && styles.cursorDisabled, props.wrapperStyle]}>
            <GenericPressable
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...propsWithoutStyling}
                ref={ref}
            />
        </View>
    );
});

PressableWithoutFeedback.displayName = 'PressableWithoutFeedback';
PressableWithoutFeedback.propTypes = GenericPressableProps.pressablePropTypes;
PressableWithoutFeedback.defaultProps = GenericPressableProps.defaultProps;

export default PressableWithoutFeedback;
