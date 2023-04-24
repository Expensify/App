import React, {forwardRef} from 'react';
import _ from 'lodash';
import propTypes from 'prop-types';
import GenericPressable from './GenericPressable';
import GenericPressablePropTypes from './GenericPressable/PropTypes';
import OpacityView from '../OpacityView';
import variables from '../../styles/variables';

const omitedProps = ['style', 'pressStyle', 'hoverStyle', 'focusStyle', 'wrapperStyle'];

const PressableWithFeedbackPropTypes = {
    ..._.omit(GenericPressablePropTypes.pressablePropTypes, omitedProps),
    pressDimmingValue: propTypes.number,
    hoverDimmingValue: propTypes.number,
};

const PressableWithFeedbackDefaultProps = {
    ..._.omit(GenericPressablePropTypes.defaultProps, omitedProps),
    pressDimmingValue: variables.pressDimValue,
    hoverDimmingValue: variables.hoverDimValue,
    wrapperStyle: [],
};

const PressableWithFeedback = forwardRef((props, ref) => {
    const propsWithoutStyling = _.omit(props, omitedProps);
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <GenericPressable ref={ref} style={props.wrapperStyle} {...propsWithoutStyling}>
            {state => (
                <OpacityView
                    shouldDim={state.pressed || state.hovered}
                    dimmingValue={state.pressed ? props.pressDimmingValue : props.hoverDimmingValue}
                    style={[
                        props.style,
                        state.pressed && props.pressStyle,
                        state.hovered && props.hoverStyle,
                        state.focused && props.focusStyle,
                    ]}
                >
                    {props.children}
                </OpacityView>
            )}
        </GenericPressable>
    );
});

PressableWithFeedback.displayName = 'PressableWithFeedback';
PressableWithFeedback.propTypes = PressableWithFeedbackPropTypes;
PressableWithFeedback.defaultProps = PressableWithFeedbackDefaultProps;

export default PressableWithFeedback;
