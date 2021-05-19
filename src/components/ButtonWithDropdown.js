import React from 'react';
import PropTypes from 'prop-types';
import {View, Pressable} from 'react-native';
import styles from '../styles/styles';
import Button from './Button';
import Icon from './Icon';
import {DownArrow} from './Icon/Expensicons';
import OpacityView from './OpacityView';
import themeColors from '../styles/themes/default';

const propTypes = {
    buttonText: PropTypes.string.isRequired,
    onButtonPress: PropTypes.func,
    onDropdownPress: PropTypes.func,
    isLoading: PropTypes.bool,
};

const defaultProps = {
    onButtonPress: () => {},
    onDropdownPress: () => {},
    isLoading: false,
};

const ButtonWithDropdown = props => (
    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
        <Button
            success
            onPress={props.onButtonPress}
            text={props.buttonText}
            isLoading={props.isLoading}
            shouldRemoveRightBorder
        />
        <Pressable
            onPress={props.onDropdownPress}
            disabled={props.isLoading}
        >
            {({pressed, hovered}) => (
                <OpacityView
                    shouldDim={pressed}
                    style={[
                        styles.button,
                        styles.buttonSuccess,
                        hovered ? styles.buttonSuccessHovered : undefined,
                        styles.noLeftBorderRadius,
                        styles.buttonDropdown,
                    ]}
                >
                    <Icon src={DownArrow} fill={themeColors.textReversed} />
                </OpacityView>
            )}
        </Pressable>
    </View>
);

ButtonWithDropdown.propTypes = propTypes;
ButtonWithDropdown.defaultProps = defaultProps;
ButtonWithDropdown.displayName = 'ButtonWithDropdown';
export default ButtonWithDropdown;
