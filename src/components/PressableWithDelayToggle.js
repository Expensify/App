import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, View} from 'react-native';
import * as Expensicons from './Icon/Expensicons';
import compose from '../libs/compose';
import Icon from './Icon';
import Tooltip from './Tooltip';
import Text from './Text';
import styles from '../styles/styles';
import variables from '../styles/variables';
import getButtonState from '../libs/getButtonState';
import * as StyleUtils from '../styles/StyleUtils';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withDelayToggleButtonState, {withDelayToggleButtonStatePropTypes} from './withDelayToggleButtonState';

const propTypes = {
    text: PropTypes.string,

    textChecked: PropTypes.string,

    tooltipText: PropTypes.string,

    tooltipTextChecked: PropTypes.string,

    /** Styles to apply to the text */
    // eslint-disable-next-line react/forbid-prop-types
    styles: PropTypes.arrayOf(PropTypes.object),

    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    // eslint-disable-next-line react/forbid-prop-types
    iconStyles: PropTypes.arrayOf(PropTypes.object),

    onPress: PropTypes.func.isRequired,

    icon: PropTypes.func,

    iconChecked: PropTypes.func,

    inline: PropTypes.bool,

    ...withLocalizePropTypes,

    ...withDelayToggleButtonStatePropTypes,
};

const defaultProps = {
    text: '',
    textChecked: '',
    tooltipText: '',
    tooltipTextChecked: '',
    styles: [],
    textStyles: [],
    iconStyles: [],
    icon: null,
    inline: true,
    iconChecked: Expensicons.Checkmark,
};

function PressableWithDelayToggle(props) {
    const updatePressState = () => {
        if (props.isDelayButtonStateComplete) {
            return;
        }
        props.toggleDelayButtonState(true);
        props.onPress();
    };

    return (
        <Pressable
            ref={props.innerRef}
            focusable
            onPress={updatePressState}
            wrapperStyle={styles.buttonContainer}
            accessibilityLabel={props.isDelayButtonStateComplete ? props.tooltipText : props.tooltipTextChecked}
            style={[styles.flexRow, styles.alignItemsCenter, styles.cursorPointer, props.styles]}
        >
            {({hovered, pressed}) => (
                <View style={[styles.flexRow, styles.gap1]}>
                    <Text
                        suppressHighlighting
                        style={props.textStyles}
                    >
                        {pressed && props.textChecked ? props.textChecked : props.text}
                    </Text>
                    <Tooltip text={props.isDelayButtonStateComplete ? props.tooltipText : props.tooltipTextChecked}>
                        <Icon
                            src={props.isDelayButtonStateComplete ? props.iconChecked : props.icon}
                            fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, props.isDelayButtonStateComplete))}
                            style={props.iconStyles}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                            inline={props.inline}
                        />
                    </Tooltip>
                </View>
            )}
        </Pressable>
    );
}

PressableWithDelayToggle.propTypes = propTypes;
PressableWithDelayToggle.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withDelayToggleButtonState,
)(
    React.forwardRef((props, ref) => (
        <PressableWithDelayToggle
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            innerRef={ref}
        />
    )),
);
