import _ from 'lodash';
import GenericPressable from './GenericPressable';
import GenericPressableProps from './GenericPressable/PropTypes';

const omitedProps = [
    'pressStyle',
    'hoverStyle',
    'focusStyle',
    'activeStyle',
    'disabledStyle',
    'screenReaderActiveStyle',
    'shouldUseHapticsOnPress',
    'shouldUseHapticsOnLongPress',
];

const PressableWithoutFeedback = (props) => {
    const propsWithoutStyling = _.omit(props, omitedProps);
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <GenericPressable {...propsWithoutStyling} />;
};

PressableWithoutFeedback.displayName = 'PressableWithoutFeedback';
PressableWithoutFeedback.propTypes = _.omit(GenericPressableProps.pressablePropTypes, omitedProps);
PressableWithoutFeedback.defaultProps = _.omit(GenericPressableProps.defaultProps, omitedProps);

export default PressableWithoutFeedback;
