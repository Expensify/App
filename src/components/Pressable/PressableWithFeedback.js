import React, {forwardRef, useEffect, useState} from 'react';
import _ from 'underscore';
import propTypes from 'prop-types';
import {InteractionManager} from 'react-native';
import GenericPressable from './GenericPressable';
import GenericPressablePropTypes from './GenericPressable/PropTypes';
import OpacityView from '../OpacityView';
import variables from '../../styles/variables';

const omittedProps = ['wrapperStyle', 'onHoverIn', 'onHoverOut', 'onPressIn', 'onPressOut'];

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
};

const PressableWithFeedbackDefaultProps = {
    ...GenericPressablePropTypes.defaultProps,
    pressDimmingValue: variables.pressDimValue,
    hoverDimmingValue: variables.hoverDimValue,
    nativeID: '',
    wrapperStyle: [],
};

const PressableWithFeedback = forwardRef((props, ref) => {
    const rest = _.omit(props, omittedProps);
    const [disabled, setDisabled] = useState(props.disabled);
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setDisabled(props.disabled);
    }, [props.disabled]);

    return (
        <OpacityView
            shouldDim={Boolean(!disabled && (isPressed || isHovered))}
            dimmingValue={isPressed ? props.pressDimmingValue : props.hoverDimmingValue}
            style={props.wrapperStyle}
        >
            <GenericPressable
                ref={ref}
                disabled={disabled}
                onHoverIn={() => {
                    setIsHovered(true);
                    if (props.onHoverIn) props.onHoverIn();
                }}
                onHoverOut={() => {
                    setIsHovered(false);
                    if (props.onHoverOut) props.onHoverOut();
                }}
                onPressIn={() => {
                    setIsPressed(true);
                    if (props.onPressIn) props.onPressIn();
                }}
                onPressOut={() => {
                    setIsPressed(false);
                    if (props.onPressOut) props.onPressOut();
                }}
                onPress={(e) => {
                    setDisabled(true);
                    const onPress = props.onPress(e);
                    InteractionManager.runAfterInteractions(() => {
                        if (!(onPress instanceof Promise)) {
                            setDisabled(props.disabled);
                            return;
                        }
                        onPress.finally(() => {
                            setDisabled(props.disabled);
                        });
                    });
                }}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
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
