import React from 'react';
import PropTypes from 'prop-types';
import {WebView} from 'react-native-webview';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import moment from 'moment';
import Str from 'expensify-common/lib/str';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import CONFIG from '../../CONFIG';

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

const WalletStatementModal = (props) => {
    moment.locale(lodashGet(props, 'preferredLocale', 'en'));
    const month = lodashGet(props, 'route.params.month', moment().month() + 1);
    const year = lodashGet(props, 'route.params.year', moment().year());
    const monthName = moment(month, 'M').format('MMMM');
    const title = `${monthName} ${year} statement`;

    const authToken = lodashGet(props, 'session.authToken', null);
    const url = `${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}statements.php?period=${year}${month}`;
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={Str.recapitalize(title)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <WebView
                originWhitelist={['https://*']}
                source={{
                    uri: url,
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
