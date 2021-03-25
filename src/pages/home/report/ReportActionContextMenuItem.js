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
    // We force this one over other states
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
            hasRun: false,
        };
        this.onPress = this.onPress.bind(this);
    }

    /**
     * Called on button press and mark the run
     *
     * @memberof ReportActionContextMenuItem
     */
    onPress() {
        const pressResult = this.props.onPress();
        if (!(pressResult instanceof Promise)) {
            if (pressResult) {
                this.setState({
                    hasRun: true,
                });
            }
            return;
        }
        pressResult.then((result) => {
            if (result) {
                this.setState({
                    hasRun: true,
                });
            }
        });
    }

    render() {
        const {getButtonStyle, getIconFillColor} = getReportActionContextMenuItemStyles(this.props.isMini);
        const icon = this.state.hasRun ? this.props.successIcon || this.props.icon : this.props.icon;
        const text = this.state.hasRun ? this.props.successText || this.props.text : this.props.text;
        return (
            this.props.isMini
                ? (
                    <Tooltip text={text}>
                        <Pressable
                            onPress={this.onPress}
                            style={
                                ({hovered, pressed}) => getButtonStyle(
                                    getButtonState(hovered, pressed, this.state.hasRun),
                                )
                            }
                        >
                            {({hovered, pressed}) => (
                                <Icon
                                    src={icon}
                                    fill={getIconFillColor(getButtonState(hovered, pressed, this.state.hasRun))}
                                />
                            )}
                        </Pressable>
                    </Tooltip>
                ) : (
                    <Pressable
                        onPress={this.onPress}
                        style={
                            ({hovered, pressed}) => getButtonStyle(
                                getButtonState(hovered, pressed, this.state.hasRun),
                            )
                        }
                    >
                        {({hovered, pressed}) => (
                            <>
                                <Icon
                                    src={icon}
                                    fill={getIconFillColor(getButtonState(hovered, pressed, this.state.hasRun))}
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
