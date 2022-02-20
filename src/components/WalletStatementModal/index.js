import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import compose from '../../libs/compose';
import withLocalize from '../withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import {walletStatementPropTypes, walletStatementDefaultProps} from './WalletStatementModalPropTypes';

const WalletStatementModal = (props) => {
    const authToken = lodashGet(props, 'session.authToken', null);
    return (
        <iframe
            src={`${props.statementPageURL}&authToken=${authToken}`}
            title="Statements"
            height="100%"
            width="100%"
            seamless="seamless"
            frameBorder="0"
        />
    );
};

WalletStatementModal.propTypes = walletStatementPropTypes;
WalletStatementModal.defaultProps = walletStatementDefaultProps;
WalletStatementModal.displayName = 'WalletStatementModal';
export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(WalletStatementModal);
