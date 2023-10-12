import React, {forwardRef, useState} from 'react';
import _ from 'underscore';
import propTypes from 'prop-types';
import GenericPressable from './GenericPressable';
import GenericPressablePropTypes from './GenericPressable/PropTypes';
import OpacityView from '../OpacityView';
import variables from '../../styles/variables';

const omittedProps = ['wrapperStyle', 'needsOffscreenAlphaCompositing'];

const PressableWithFeedbackPropTypes = {
    ...GenericPressablePropTypes.pressablePropTypes,
    /**
     * Determines what opacity value should be applied to the underlaying view when Pressable is pressed.
     * To disable dimming, pass 1 as pressDimmingValue
     * @default variables.pressDimValue
     */
    pressDimmingValue: propTypes.number,
    /**
     * Determines what opacity value should be applied to the underlaying view when pressable is hovered.
     * To disable dimming, pass 1 as hoverDimmingValue
     * @default variables.hoverDimValue
     */
    hoverDimmingValue: propTypes.number,
    /**
     *  Used to locate this view from native classes.
     */
    nativeID: propTypes.string,

    /** Whether the view needs to be rendered offscreen (for Android only) */
    needsOffscreenAlphaCompositing: propTypes.bool,
};

const PressableWithFeedbackDefaultProps = {
    ...GenericPressablePropTypes.defaultProps,
    pressDimmingValue: variables.pressDimValue,
    hoverDimmingValue: variables.hoverDimValue,
    nativeID: '',
    wrapperStyle: [],
    needsOffscreenAlphaCompositing: false,
};

const PressableWithFeedback = forwardRef((props, ref) => {
    const propsWithoutWrapperProps = _.omit(props, omittedProps);
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <OpacityView
            shouldDim={Boolean(!props.disabled && (isPressed || isHovered))}
            dimmingValue={isPressed ? props.pressDimmingValue : props.hoverDimmingValue}
            style={props.wrapperStyle}
            needsOffscreenAlphaCompositing={props.needsOffscreenAlphaCompositing}
        >
            <GenericPressable
                ref={ref}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...propsWithoutWrapperProps}
                disabled={props.disabled}
                onHoverIn={() => {
                    setIsHovered(true);
                    if (props.onHoverIn) {
                        props.onHoverIn();
                    }
                }}
                onHoverOut={() => {
                    setIsHovered(false);
                    if (props.onHoverOut) {
                        props.onHoverOut();
                    }
                }}
                onPressIn={() => {
                    setIsPressed(true);
                    if (props.onPressIn) {
                        props.onPressIn();
                    }
                }}
                onPressOut={() => {
                    setIsPressed(false);
                    if (props.onPressOut) {
                        props.onPressOut();
                    }
                }}
            >
                {(state) => (_.isFunction(props.children) ? props.children(state) : props.children)}
            </GenericPressable>
        </OpacityView>
    );
});

PressableWithFeedback.displayName = 'PressableWithFeedback';
PressableWithFeedback.propTypes = PressableWithFeedbackPropTypes;
PressableWithFeedback.defaultProps = PressableWithFeedbackDefaultProps;

export default PressableWithFeedback;
