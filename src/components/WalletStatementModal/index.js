import React from 'react';
import walletStatementPropTypes from './WalletStatementModalPropTypes';
import PropTypes from 'prop-types';
import compose from '../../libs/compose';
import withLocalize from '../withLocalize';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import lodashGet from 'lodash/get';

const propTypes = {
    /* Onyx Props */
    /** Session info for the currently logged in user. */
    session: PropTypes.shape({

        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

    ...walletStatementPropTypes,
};

const defaultProps = {
    session: {
        authToken: null,
    },
};

const WalletStatementModal = props => {
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
    )
}

WalletStatementModal.propTypes = propTypes;
WalletStatementModal.defaultProps = defaultProps;
WalletStatementModal.displayName = 'WalletStatementModal';
export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(WalletStatementModal);
