import React from 'react';
import _ from 'underscore';
import GenericPressable from './GenericPressable';
import GenericPressableProps from './GenericPressable/PropTypes';

const omittedProps = ['pressStyle', 'hoverStyle', 'focusStyle', 'activeStyle', 'disabledStyle', 'screenReaderActiveStyle', 'shouldUseHapticsOnPress', 'shouldUseHapticsOnLongPress'];

const PressableWithoutFeedback = (props) => {
    const propsWithoutStyling = _.omit(props, omittedProps);
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <GenericPressable {...propsWithoutStyling} />;
};

PressableWithoutFeedback.displayName = 'PressableWithoutFeedback';
PressableWithoutFeedback.propTypes = _.omit(GenericPressableProps.pressablePropTypes, omittedProps);
PressableWithoutFeedback.defaultProps = _.omit(GenericPressableProps.defaultProps, omittedProps);

export default PressableWithoutFeedback;
