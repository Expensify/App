import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Pressable, Text} from 'react-native';
import Tooltip from '../../../components/Tooltip';
import Icon from '../../../components/Icon';
import getReportActionContextMenuItemStyles from '../../../styles/getReportActionContextMenuItemStyles';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';

/**
 * Get the string representation of a button's state.
 *
 * @param {Boolean} [isHovered]
 * @param {Boolean} [isPressed]
 * @param {Boolean} [isComplete]
 * @returns {String}
 */
function getButtonState(isHovered = false, isPressed = false, isComplete = false) {
    if (isComplete) {
        return CONST.BUTTON_STATES.COMPLETE;
    }

    if (isPressed) {
        return CONST.BUTTON_STATES.PRESSED;
    }

    if (isHovered) {
        return CONST.BUTTON_STATES.HOVERED;
    }

    return CONST.BUTTON_STATES.DEFAULT;
}

const propTypes = {
    icon: PropTypes.elementType.isRequired,
    text: PropTypes.string.isRequired,
    successIcon: PropTypes.elementType,
    successText: PropTypes.string,
    isMini: PropTypes.bool,
    onPress: PropTypes.func.isRequired,
};

const defaultProps = {
    isMini: false,
    successIcon: null,
    successText: '',
};

class ReportActionContextMenuItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            success: false,
        };
        this.onPress = this.onPress.bind(this);
    }

    /**
     * Called on button press and mark the run
     *
     * @memberof ReportActionContextMenuItem
     */
    onPress() {
        if (this.state.success) {
            return;
        }
        const pressResult = this.props.onPress();
        if (pressResult) {
            this.setState({
                success: true,
            });
        }
    }

    render() {
        const {getButtonStyle, getIconFillColor} = getReportActionContextMenuItemStyles(this.props.isMini);
        const icon = this.state.success ? this.props.successIcon || this.props.icon : this.props.icon;
        const text = this.state.success ? this.props.successText || this.props.text : this.props.text;
        return (
            this.props.isMini
                ? (
                    <Tooltip text={text}>
                        <Pressable
                            onPress={this.onPress}
                            style={
                                ({hovered, pressed}) => getButtonStyle(
                                    getButtonState(hovered, pressed, this.state.success),
                                )
                            }
                        >
                            {({hovered, pressed}) => (
                                <Icon
                                    src={icon}
                                    fill={getIconFillColor(getButtonState(hovered, pressed, this.state.success))}
                                />
                            )}
                        </Pressable>
                    </Tooltip>
                ) : (
                    <Pressable
                        onPress={this.onPress}
                        style={
                            ({hovered, pressed}) => getButtonStyle(
                                getButtonState(hovered, pressed, this.state.success),
                            )
                        }
                    >
                        {({hovered, pressed}) => (
                            <>
                                <Icon
                                    src={icon}
                                    fill={getIconFillColor(getButtonState(hovered, pressed, this.state.success))}
                                />
                                <Text
                                    style={styles.reportActionContextMenuText}
                                    selectable={false}
                                >
                                    {text}
                                </Text>
                            </>
                        )}
                    </Pressable>
                )
        );
    }
}


ReportActionContextMenuItem.propTypes = propTypes;
ReportActionContextMenuItem.defaultProps = defaultProps;
ReportActionContextMenuItem.displayName = 'ReportActionContextMenuItem';

export default ReportActionContextMenuItem;
