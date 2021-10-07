import React from 'react';
import PropTypes from 'prop-types';
import {Text, TouchableOpacity} from 'react-native';
import {Checkmark, Clipboard as ClipboardIcon} from './Icon/Expensicons';
import Clipboard from '../libs/Clipboard';
import Icon from './Icon';
import styles from '../styles/styles';

const propTypes = {
    /** The text to display and copy to the clipboard */
    text: PropTypes.string.isRequired,

    /** Styles to apply to the text */
    textStyles: PropTypes.arrayOf(PropTypes.object),
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
            <TouchableOpacity
                onPress={this.copyToClipboard}
                style={[styles.flexRow]}
            >
                <Text style={this.props.textStyles}>{this.props.text}</Text>
                {this.state.showCheckmark
                    ? <Icon src={Checkmark} height={20} width={20} />
                    : <Icon src={ClipboardIcon} height={20} width={20} />}
            </TouchableOpacity>
        );
    }
}

CopyTextToClipboard.propTypes = propTypes;
CopyTextToClipboard.defaultProps = defaultProps;

export default CopyTextToClipboard;
