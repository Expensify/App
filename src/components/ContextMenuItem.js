import React, {Component} from 'react';
import PropTypes from 'prop-types';
import MenuItem from './MenuItem';
import Icon from './Icon';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import getButtonState from '../libs/getButtonState';
import withDelayToggleButtonState, {withDelayToggleButtonStatePropTypes} from './withDelayToggleButtonState';
import BaseMiniContextMenuItem from './BaseMiniContextMenuItem';
import withWindowDimensions from './withWindowDimensions';
import compose from '../libs/compose';
import getContextMenuItemStyles from '../styles/getContextMenuItemStyles';

const propTypes = {
    /** Icon Component */
    icon: PropTypes.elementType.isRequired,

    /** Text to display */
    text: PropTypes.string.isRequired,

    /** Icon to show when interaction was successful */
    successIcon: PropTypes.elementType,

    /** Text to show when interaction was successful */
    successText: PropTypes.string,

    /** Whether to show the mini menu */
    isMini: PropTypes.bool,

    /** Callback to fire when the item is pressed */
    onPress: PropTypes.func.isRequired,

    /** Automatically reset the success status */
    autoReset: PropTypes.bool,

    /** A description text to show under the title */
    description: PropTypes.string,

    ...withDelayToggleButtonStatePropTypes,
};

const defaultProps = {
    isMini: false,
    successIcon: null,
    successText: '',
    autoReset: true,
    description: '',
};

class ContextMenuItem extends Component {
    constructor(props) {
        super(props);

        this.triggerPressAndUpdateSuccess = this.triggerPressAndUpdateSuccess.bind(this);
    }

    /**
     * Method to call parent onPress and toggleDelayButtonState
     */
    triggerPressAndUpdateSuccess() {
        if (this.props.isDelayButtonStateComplete) {
            return;
        }
        this.props.onPress();

        // We only set the success state when we have icon or text to represent the success state
        // We may want to replace this check by checking the Result from OnPress Callback in future.
        if (this.props.successIcon || this.props.successText) {
            this.props.toggleDelayButtonState(this.props.autoReset);
        }
    }

    render() {
        const icon = this.props.isDelayButtonStateComplete ? this.props.successIcon || this.props.icon : this.props.icon;
        const text = this.props.isDelayButtonStateComplete ? this.props.successText || this.props.text : this.props.text;
        return this.props.isMini ? (
            <BaseMiniContextMenuItem
                tooltipText={text}
                onPress={this.triggerPressAndUpdateSuccess}
                isDelayButtonStateComplete={this.props.isDelayButtonStateComplete}
            >
                {({hovered, pressed}) => (
                    <Icon
                        small
                        src={icon}
                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, this.props.isDelayButtonStateComplete))}
                    />
                )}
            </BaseMiniContextMenuItem>
        ) : (
            <MenuItem
                title={text}
                icon={icon}
                onPress={this.triggerPressAndUpdateSuccess}
                wrapperStyle={styles.pr9}
                success={this.props.isDelayButtonStateComplete}
                description={this.props.description}
                descriptionTextStyle={styles.breakAll}
                style={getContextMenuItemStyles(this.props.windowWidth)}
            />
        );
    }
}

ContextMenuItem.propTypes = propTypes;
ContextMenuItem.defaultProps = defaultProps;

export default compose(withWindowDimensions, withDelayToggleButtonState)(ContextMenuItem);
