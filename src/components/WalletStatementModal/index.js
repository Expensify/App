import React, {Component} from 'react';
import {Linking} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    url: PropTypes.string.isRequired,
};

class WalletStatementModal extends Component {
    constructor(props) {
        super(props);
        // this.closeOnOutsideClick = this.closeOnOutsideClick.bind(this);
    }

    componentDidMount() {
        Linking.openURL('https://community.expensify.com/discussion/4724/faq-why-cant-i-close-my-account');
        // if (!this.props.shouldCloseOnOutsideClick) {
        //     return;
        // }
        //
        // document.addEventListener('mousedown', this.closeOnOutsideClick);
    }

    render() {
        return null;
    }
}

WalletStatementModal.propTypes = propTypes;
WalletStatementModal.displayName = 'WalletStatementModal';
export default WalletStatementModal;

