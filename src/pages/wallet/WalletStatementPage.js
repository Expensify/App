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
import WalletStatementModal from '../../components/WalletStatementModal';

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

const WalletStatementPage = (props) => {
    moment.locale(lodashGet(props, 'preferredLocale', 'en'));
    const month = lodashGet(props.route.params, 'month', moment().month());
    const year = lodashGet(props.route.params, 'year', moment().year());
    const monthName = moment(month, 'M').format('MMMM');
    const title = `${monthName} ${year} statement`;

    // const authToken = lodashGet(props, 'session.authToken', null);
    // const url = `${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}statements.php?period=${year}${month}`;
    const authToken = '21B34D8D824054245CE02209BE282D7DBA8BA9B29CE1DAFB5541E6D955DE1798660BBB21A94C4413E8D1AD34B5EAEC3A9C70FC845618C581C9CA6470C342C4EF1CFE9E11B947F791C264EAD69FE882525A326F368929C16C21611A9BEE7AAEFCAAFF5166F5A9BA04D4244FD0DE06E59E561FFB8313502D77C959AA365295A331F32195368493B196929BF7B4DF5EC529F9A90A80683C1555B68E3E972D17526B22138612DA0905B03910A266EAB4957111C857880C3AEB1ED80731199CD9D056EB59EC87D48C30C523E62F3DC74183FD6B36453984EF87EC57D50ABCF17C4FDEA05F09464D6CB69F8AF52683D6E49B98E1D0DB98D3C127FC94824BE952CE6ACDC4C90113194716F8FF68171A0E62BC8C59B809272A80D3F5902251255816AAA51892FD1DD374997A88E3F817AB32208A';
    const url = `https://www.expensify.com/statement.php`;
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={Str.recapitalize(title)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            {/*<WebView*/}
            {/*    originWhitelist={['https://*']}*/}
            {/*    source={{*/}
            {/*        uri: url,*/}
            {/*        headers: {*/}
            {/*            Cookie: `authToken=${authToken}`,*/}
            {/*        },*/}
            {/*    }}*/}
            {/*/>*/}
            <WalletStatementModal url={url}/>
        </ScreenWrapper>
    );
};

WalletStatementPage.propTypes = propTypes;
WalletStatementPage.defaultProps = defaultProps;
WalletStatementPage.displayName = 'WalletStatementPage';
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
)(WalletStatementPage);
