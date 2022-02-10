import React from 'react';
import PropTypes from 'prop-types';
import {WebView} from 'react-native-webview';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import Modal from '../../components/Modal/index.ios';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import ROUTES from '../../ROUTES';

const propTypes = {
    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** The statement year */
            year: PropTypes.string.isRequired,

            /** The statement month */
            month: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    ...withLocalizePropTypes,
};

const WalletStatementModal = props => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title={"Statements Page"}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
        />
        <WebView
            originWhitelist={['*']}
            source={{uri: 'http://www.expensify.com.dev/statement?period=202110'}}
            // containerStyle={{ flex: 0, height: 300, width: 300, marginTop: 20 }}
            // style={{ flex: 0, height: 300, width: 300, marginTop: 20,}}
        />
    </ScreenWrapper>
);

WalletStatementModal.propTypes = propTypes;
WalletStatementModal.displayName = 'WalletStatementModal';
export default withLocalize(WalletStatementModal);
