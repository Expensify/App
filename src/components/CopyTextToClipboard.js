import React from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import * as Expensicons from './Icon/Expensicons';
import Clipboard from '../libs/Clipboard';
import Icon from './Icon';
import Tooltip from './Tooltip';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
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
                <Text style={this.props.textStyles}>{this.props.text}</Text>
                <Tooltip text={this.props.translate(`reportActionContextMenu.${this.state.showCheckmark ? 'copied' : 'copyToClipboard'}`)}>
                    <Icon
                        src={this.state.showCheckmark ? Expensicons.Checkmark : Expensicons.Clipboard}
                        fill={this.state.showCheckmark ? themeColors.iconSuccessFill : themeColors.icon}
                        width={variables.iconSizeSmall}
                        height={variables.iconSizeSmall}
                        inline
                    />
                </Tooltip>
            </Text>
        );
    }
}

CopyTextToClipboard.propTypes = propTypes;
CopyTextToClipboard.defaultProps = defaultProps;

export default withLocalize(CopyTextToClipboard);
