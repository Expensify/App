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
import Onyx, {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import lodashGet from 'lodash/get';
import compose from '../../libs/compose';
import CONFIG from '../../CONFIG';
import Str from 'expensify-common/lib/str';
import moment from 'moment';

const propTypes = {
    /* Onyx Props */
    /** Session info for the currently logged in user. */
    session: PropTypes.shape({

        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

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

const defaultProps = {
    session: {
        authToken: null,
    },
};

// ${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}${url}${url.indexOf('?') === -1 ? '?' : '&'}authToken=${shortLivedAuthToken}

const WalletStatementModal = (props) => {
    const month = props.route.params.month;
    const year = props.route.params.year;

    moment.locale(lodashGet(props, 'preferredLocale', 'en'));
    const monthName = moment(month, 'M').format('MMMM');
    const title = `${monthName} ${year} statement`;

    const authToken = lodashGet(props, 'session.authToken', null);
    const url = `${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}statements.php?period=${year}${month}&authToken=${authToken}`;
    console.log(url);
    console.log(authToken);
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={Str.recapitalize(title)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <WebView
                originWhitelist={['https://*']}
                source={{
                    uri: 'https://www.expensify.com/statement.php?period=202110',
                    headers: {
                        Cookie: `authToken=${authToken}`,
                    },
                }}
                sharedCookiesEnabled
            />
        </ScreenWrapper>
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
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(WalletStatementModal);
