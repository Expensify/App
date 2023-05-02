import React from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import * as Expensicons from './Icon/Expensicons';
import Clipboard from '../libs/Clipboard';
import getButtonState from '../libs/getButtonState';
import Icon from './Icon';
import Tooltip from './Tooltip';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import variables from '../styles/variables';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The text to display and copy to the clipboard */
    text: PropTypes.string.isRequired,

    /** Styles to apply to the text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
};

const defaultProps = {
    textStyles: [],
};

class CopyTextToClipboard extends React.Component {
    constructor(props) {
        super(props);

        this.copyToClipboard = this.copyToClipboard.bind(this);

        this.state = {
            showCheckmark: false,
        };
    }

    componentWillUnmount() {
        // Clear the interval when the component unmounts so that if the user navigates
        // away quickly, then setState() won't try to update a component that's been unmounted
        clearInterval(this.showCheckmarkInterval);
    }

    copyToClipboard() {
        Clipboard.setString(this.props.text);
        this.setState({showCheckmark: true}, () => {
            this.showCheckmarkInterval = setTimeout(() => {
                this.setState({showCheckmark: false});
            }, 2000);
        });
    }

    render() {
        return (
            <Text
                onPress={this.copyToClipboard}
                style={[styles.flexRow, styles.cursorPointer]}
                suppressHighlighting
            >
                <Text style={this.props.textStyles}>{`${this.props.text} `}</Text>
                <Tooltip text={this.props.translate(`reportActionContextMenu.${this.state.showCheckmark ? 'copied' : 'copyToClipboard'}`)}>
                    <Pressable onPress={this.copyToClipboard}>
                        {({hovered, pressed}) => (
                            <Icon
                                src={this.state.showCheckmark ? Expensicons.Checkmark : Expensicons.Copy}
                                fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, this.state.showCheckmark))}
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

export default withLocalize(CopyTextToClipboard);
