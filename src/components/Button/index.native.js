import _ from 'underscore';
import React from 'react';
import {
    Pressable, ActivityIndicator,
} from 'react-native';
import {propTypes, defaultProps} from './ButtonPropTypes';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import OpacityView from '../OpacityView';
import Text from '../Text';

const Button = (props) => {
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];

    function renderContent() {
        const {ContentComponent} = props;
        if (ContentComponent) {
            return <ContentComponent />;
        }

        return props.isLoading
            ? (
                <ActivityIndicator color={themeColors.textReversed} />
            ) : (
                <Text
                    selectable={false}
                    style={[
                        styles.buttonText,
                        props.small && styles.buttonSmallText,
                        props.large && styles.buttonLargeText,
                        props.success && styles.buttonSuccessText,
                        props.danger && styles.buttonDangerText,
                        ...props.textStyles,
                    ]}
                >
                    {props.text}
                </Text>
            );
    }

    return (
        <Pressable
            onPress={props.onPress}
            disabled={props.isLoading || props.isDisabled}
            style={[
                ...additionalStyles,
            ]}
        >
            {({pressed, hovered}) => (
                <OpacityView
                    shouldDim={pressed}
                    style={[
                        styles.button,
                        props.small ? styles.buttonSmall : undefined,
                        props.large ? styles.buttonLarge : undefined,
                        props.success ? styles.buttonSuccess : undefined,
                        props.danger ? styles.buttonDanger : undefined,
                        (props.isDisabled && props.danger) ? styles.buttonDangerDisabled : undefined,
                        (props.isDisabled && !props.danger) ? styles.buttonDisable : undefined,
                        (props.success && hovered) ? styles.buttonSuccessHovered : undefined,
                        (props.danger && hovered) ? styles.buttonDangerHovered : undefined,
                        props.shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
                        props.shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
                    ]}
                >
                    {renderContent()}
                </OpacityView>
            )}
        </Pressable>
    );
};

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;
Button.displayName = 'Button';

export default Button;
