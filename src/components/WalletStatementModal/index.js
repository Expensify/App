import React, {Component} from 'react';
import {Linking} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    url: PropTypes.string.isRequired,
};

class WalletStatementModal extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        Linking.openURL(url);
    }

    render() {
        return null;
    }
}

WalletStatementModal.propTypes = propTypes;
WalletStatementModal.displayName = 'WalletStatementModal';
export default WalletStatementModal;

