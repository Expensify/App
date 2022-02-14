import React from 'react';
import walletStatementPropTypes from './WalletStatementModalPropTypes';

const WalletStatementModal = props => (
    <iframe
        src={props.statementPageURL}
        title="Statements"
    />
);

WalletStatementModal.propTypes = walletStatementPropTypes;
WalletStatementModal.displayName = 'WalletStatementModal';
export default WalletStatementModal;
