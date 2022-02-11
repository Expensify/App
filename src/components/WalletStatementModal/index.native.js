import React from 'react';
import PropTypes from 'prop-types';
import {WebView} from 'react-native-webview';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import withLocalize from '../withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import walletStatementPropTypes from './WalletStatementModalPropTypes';

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

const WalletStatementModal = (props) => {
    const authToken = lodashGet(props, 'session.authToken', null);
    return (
            <WebView
                originWhitelist={['https://*']}
                source={{
                    uri: props.statementPageURL,
                    headers: {
                        Cookie: `authToken=${authToken}`,
                    },
                }}
                // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                incognito
            />
    );
};

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
