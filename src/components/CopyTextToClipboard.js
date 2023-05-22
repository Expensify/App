import React from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import * as Expensicons from './Icon/Expensicons';
import compose from '../libs/compose';
import Clipboard from '../libs/Clipboard';
import getButtonState from '../libs/getButtonState';
import Icon from './Icon';
import Tooltip from './Tooltip';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import variables from '../styles/variables';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withDelayToggleButtonState, {withDelayToggleButtonStatePropTypes} from './withDelayToggleButtonState';

const propTypes = {
    /** The text to display and copy to the clipboard */
    text: PropTypes.string.isRequired,

    /** Styles to apply to the text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,

    ...withDelayToggleButtonStatePropTypes,
};

const defaultProps = {
    textStyles: [],
};

class CopyTextToClipboard extends React.Component {
    constructor(props) {
        super(props);

        this.copyToClipboard = this.copyToClipboard.bind(this);
    }

    copyToClipboard() {
        if (this.props.isDelayButtonStateComplete) {
            return;
        }
        Clipboard.setString(this.props.text);
        this.props.toggleDelayButtonState(true);
    }

    render() {
        return (
            <Text
                onPress={this.copyToClipboard}
                style={[styles.flexRow, styles.cursorPointer]}
                suppressHighlighting
            >
                <Text style={this.props.textStyles}>{`${this.props.text} `}</Text>
                <Tooltip text={this.props.translate(`reportActionContextMenu.${this.props.isDelayButtonStateComplete ? 'copied' : 'copyToClipboard'}`)}>
                    <Pressable onPress={this.copyToClipboard}>
                        {({hovered, pressed}) => (
                            <Icon
                                src={this.props.isDelayButtonStateComplete ? Expensicons.Checkmark : Expensicons.Copy}
                                fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, this.props.isDelayButtonStateComplete))}
                                width={variables.iconSizeSmall}
                                height={variables.iconSizeSmall}
                                inline
                            />
                        )}
                    </Pressable>
                </Tooltip>
            </Text>
        );
    }
}

CopyTextToClipboard.propTypes = propTypes;
CopyTextToClipboard.defaultProps = defaultProps;

export default compose(withLocalize, withDelayToggleButtonState)(CopyTextToClipboard);
