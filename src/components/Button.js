import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {
    Text, Pressable, ActivityIndicator, View,
} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import OpacityView from './OpacityView';
import {DownArrow} from './Icon/Expensicons';
import Icon from './Icon';

const propTypes = {
    /** The text for the button label */
    text: PropTypes.string.isRequired,

    /** Indicates whether the button should be disabled and in the loading state */
    isLoading: PropTypes.bool,

    /** Indicates whether the button should be disabled */
    isDisabled: PropTypes.bool,

    /** A function that is called when the button is clicked on */
    onPress: PropTypes.func,

    /** Additional styles to add after local styles */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),

    /** Additional text styles */
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Whether we should use the success theme color */
    success: PropTypes.bool,

    /** Optional content component to replace all inner contents of button */
    ContentComponent: PropTypes.func,

    /** Should we show a drop down arrow to the right? */
    shouldShowDropDownArrow: PropTypes.bool,

    /** Callback function to fire when the dropdown element is pressed */
    onDropdownPress: PropTypes.func,
};

const defaultProps = {
    isLoading: false,
    isDisabled: false,
    onPress: () => {},
    style: [],
    textStyles: [],
    success: false,
    ContentComponent: undefined,
    shouldShowDropDownArrow: false,
    onDropdownPress: () => {},
};

const Button = (props) => {
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];
    const shouldUseSuccessStyles = props.shouldShowDropDownArrow || props.success;

    function renderContent() {
        const {ContentComponent} = props;
        if (ContentComponent) {
            return <ContentComponent />;
        }

        return (
            <>
                {props.isLoading
                    ? (
                        <ActivityIndicator color={themeColors.textReversed} />
                    ) : (
                        <Text
                            selectable={false}
                            style={[
                                styles.buttonText,
                                shouldUseSuccessStyles && styles.buttonSuccessText,
                                ...props.textStyles,
                            ]}
                        >
                            {props.text}
                        </Text>
                    )}
            </>
        );
    }

    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
            <Pressable
                onPress={props.onPress}
                disabled={props.isLoading || props.isDisabled}
                style={[
                    ...additionalStyles,
                    styles.flex1,
                ]}
            >
                {({pressed, hovered}) => (
                    <OpacityView
                        shouldDim={pressed}
                        style={[
                            styles.button,
                            shouldUseSuccessStyles ? styles.buttonSuccess : undefined,
                            props.isDisabled ? styles.buttonDisable : undefined,
                            (shouldUseSuccessStyles && hovered) ? styles.buttonSuccessHovered : undefined,
                            props.shouldShowDropDownArrow ? styles.noRightBorderRadius : undefined,
                        ]}
                    >
                        {renderContent()}
                    </OpacityView>
                )}
            </Pressable>
            {props.shouldShowDropDownArrow && (
                <Pressable
                    onPress={props.onDropdownPress}
                    disabled={props.isLoading || props.isDisabled}
                >
                    {({pressed, hovered}) => (
                        <OpacityView
                            shouldDim={pressed}
                            style={[
                                styles.button,
                                styles.buttonSuccess,
                                hovered ? styles.buttonSuccessHovered : undefined,
                                styles.noLeftBorderRadius,
                                {marginLeft: 2}, // cc @shawnborton
                            ]}
                        >
                            <Icon src={DownArrow} fill={themeColors.textReversed} />
                        </OpacityView>
                    )}
                </Pressable>
            )}
        </View>
    );
};

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;
Button.displayName = 'Button';

export default Button;
