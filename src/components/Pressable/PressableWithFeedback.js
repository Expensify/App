import React, {forwardRef, useEffect, useState} from 'react';
import _ from 'underscore';
import propTypes from 'prop-types';
import {InteractionManager} from 'react-native';
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
    const [disabled, setDisabled] = useState(props.disabled);

    useEffect(() => {
        setDisabled(props.disabled);
    }, [props.disabled]);

    return (
        <GenericPressable
            ref={ref}
            style={props.wrapperStyle}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsWithoutStyling}
            disabled={disabled}
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
        >
            {(state) => (
                <OpacityView
                    shouldDim={Boolean(!disabled && (state.pressed || state.hovered))}
                    dimmingValue={state.pressed ? props.pressDimmingValue : props.hoverDimmingValue}
                    style={[
                        ...StyleUtils.parseStyleFromFunction(props.style, state),
                        ...(!disabled && state.pressed ? StyleUtils.parseStyleFromFunction(props.pressStyle, state) : []),
                        ...(!disabled && state.hovered ? StyleUtils.parseStyleAsArray(props.hoverStyle, state) : []),
                        ...(state.focused ? StyleUtils.parseStyleAsArray(props.focusStyle, state) : []),
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
