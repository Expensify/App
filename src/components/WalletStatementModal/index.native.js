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
    // const authToken = lodashGet(props, 'session.authToken', null);
    const authToken = 'FA230CDE3CCDA1FC4C61E02D5B5BA3F191C69C9B9D577510D920868C9DCE3C59A4D735FDB5295227E23259FE5E71C8AC8AD58D22F8A1DAF2A80FF18E88BB768DD685C9F551C542346D92278B74C952C36F162C4F44DA980C42DF07739FA73D1199B8E735B5FA1C416C1B2CD9087152DCC6EA389AE1030C03F472E162F4B3CEFC339EF10DD78145A358F448114D2ACEFE6595D3429705979801017F0C738B8075EB75EFBF69305E8992B0B8122BB03E9E52E8A2E99842FD22D0B45C47F15495DB950EBE60A65D97162F305B1CEA50A3A8C5741C01837400AD9C0AA63294D280D0F9F65B194C89BF292B5C16C0B6076F35D65B3549E3AD43616F0941429E7BBE92D3CB22723EEADF8EEEB330CB9AA9158EA5484132135B76BBEB635074BC3D6283E4A4D568E2924E27C3F2CDB1E9B7C5E4';
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
