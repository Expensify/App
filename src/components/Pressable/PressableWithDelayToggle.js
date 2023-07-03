import React from 'react';
import PropTypes from 'prop-types';
import * as Expensicons from '../Icon/Expensicons';
import compose from '../../libs/compose';
import Icon from '../Icon';
import Tooltip from '../Tooltip';
import Text from '../Text';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import getButtonState from '../../libs/getButtonState';
import * as StyleUtils from '../../styles/StyleUtils';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withDelayToggleButtonState, {withDelayToggleButtonStatePropTypes} from '../withDelayToggleButtonState';
import PressableWithoutFeedback from './PressableWithoutFeedback';

const propTypes = {
    ...withLocalizePropTypes,

    ...withDelayToggleButtonStatePropTypes,

    /** The text to display */
    text: PropTypes.string,

    /** The text to display once the pressable is pressed */
    textChecked: PropTypes.string,

    /** The tooltip text to display */
    tooltipText: PropTypes.string,

    /** The tooltip text to display once the pressable is pressed */
    tooltipTextChecked: PropTypes.string,

    /** Styles to apply to the container */
    // eslint-disable-next-line react/forbid-prop-types
    styles: PropTypes.arrayOf(PropTypes.object),

    /** Styles to apply to the text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Styles to apply to the icon */
    // eslint-disable-next-line react/forbid-prop-types
    iconStyles: PropTypes.arrayOf(PropTypes.object),

    /** Callback to be called on onPress */
    onPress: PropTypes.func.isRequired,

    /** The icon to display */
    icon: PropTypes.func,

    /** The icon to display once the pressable is pressed */
    iconChecked: PropTypes.func,

    /**
     * Should be set to `true` if this component is being rendered inline in
     * another `Text`. This is due to limitations in RN regarding the
     * vertical text alignment of non-Text elements
     */
    inline: PropTypes.bool,
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

    // Due to limitations in RN regarding the vertical text alignment of non-Text elements,
    // for elements that are supposed to be inline, we need to use a Text element instead
    // of a Pressable
    const PressableView = props.inline ? Text : PressableWithoutFeedback;
    const tooltipText = props.isDelayButtonStateComplete ? props.tooltipTextChecked : props.tooltipText;

    return (
        <PressableView
            ref={props.innerRef}
            style={[styles.flexRow, ...props.styles]}
            onPress={updatePressState}
            accessibilityLabel={tooltipText}
        >
            <>
                <Text
                    suppressHighlighting
                    style={props.textStyles}
                >
                    {props.isDelayButtonStateComplete && props.textChecked ? props.textChecked : props.text}
                    &nbsp;
                </Text>
                <Tooltip
                    containerStyles={[styles.flexRow]}
                    text={tooltipText}
                >
                    <PressableWithoutFeedback
                        focusable={false}
                        accessible={false}
                        onPress={updatePressState}
                    >
                        {({hovered, pressed}) => (
                            <>
                                {props.icon && (
                                    <Icon
                                        src={props.isDelayButtonStateComplete ? props.iconChecked : props.icon}
                                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, props.isDelayButtonStateComplete))}
                                        style={props.iconStyles}
                                        width={variables.iconSizeSmall}
                                        height={variables.iconSizeSmall}
                                    />
                                )}
                            </>
                        )}
                    </PressableWithoutFeedback>
                </Tooltip>
            </>
        </PressableView>
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
