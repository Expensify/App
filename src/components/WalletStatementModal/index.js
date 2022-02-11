import React, {Component} from 'react';
import {Linking} from 'react-native';
import {walletStatementPropTypes} from './WalletStatementModalPropTypes';

class WalletStatementModal extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        Linking.openURL(this.props.statementPageURL);
    }

    render() {
        return null;
    }
}

WalletStatementModal.propTypes = walletStatementPropTypes;
WalletStatementModal.displayName = 'WalletStatementModal';
export default WalletStatementModal;

