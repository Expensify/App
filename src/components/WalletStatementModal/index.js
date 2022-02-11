import {PureComponent} from 'react';
import {Linking} from 'react-native';
import walletStatementPropTypes from './WalletStatementModalPropTypes';

/**
 * In order to display the Wallet Statements page on Web, we simply
 * link to the oldDot URL that will display the page for us.
 */
class WalletStatementModal extends PureComponent {
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
