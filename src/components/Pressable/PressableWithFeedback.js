import React, {forwardRef} from 'react';
import _ from 'underscore';
import propTypes from 'prop-types';
import GenericPressable from './GenericPressable';
import GenericPressablePropTypes from './GenericPressable/PropTypes';
import OpacityView from '../OpacityView';
import variables from '../../styles/variables';
import * as StyleUtils from '../../styles/StyleUtils';

const omittedProps = ['style', 'pressStyle', 'hoverStyle', 'focusStyle', 'wrapperStyle'];

const PressableWithFeedbackPropTypes = {
    ..._.omit(GenericPressablePropTypes.pressablePropTypes, omittedProps),
    pressDimmingValue: propTypes.number,
    hoverDimmingValue: propTypes.number,
};

const PressableWithFeedbackDefaultProps = {
    ..._.omit(GenericPressablePropTypes.defaultProps, omittedProps),
    pressDimmingValue: variables.pressDimValue,
    hoverDimmingValue: variables.hoverDimValue,
    wrapperStyle: [],
};

const PressableWithFeedback = forwardRef((props, ref) => {
    const propsWithoutStyling = _.omit(props, omittedProps);
    return (
        <GenericPressable
            ref={ref}
            style={props.wrapperStyle}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsWithoutStyling}
        >
            {(state) => (
                <OpacityView
                    shouldDim={state.pressed || state.hovered}
                    dimmingValue={state.pressed ? props.pressDimmingValue : props.hoverDimmingValue}
                    style={[
                        StyleUtils.parseStyleFromFunction(props.style, state),
                        state.pressed && StyleUtils.parseStyleFromFunction(props.pressStyle, state),
                        state.hovered && StyleUtils.parseStyleAsArray(props.hoverStyle, state),
                        state.focused && StyleUtils.parseStyleAsArray(props.focusStyle, state),
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
