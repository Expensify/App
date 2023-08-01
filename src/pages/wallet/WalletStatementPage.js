import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import moment from 'moment';
import Str from 'expensify-common/lib/str';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import CONFIG from '../../CONFIG';
import WalletStatementModal from '../../components/WalletStatementModal';
import * as User from '../../libs/actions/User';
import fileDownload from '../../libs/fileDownload';
import Growl from '../../libs/Growl';
import CONST from '../../CONST';
import FullPageOfflineBlockingView from '../../components/BlockingViews/FullPageOfflineBlockingView';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

const propTypes = {
    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** The statement year and month as one string, i.e. 202110 */
            yearMonth: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    walletStatement: PropTypes.shape({
        /** Whether we are currently generating a PDF version of the statement */
        isGenerating: PropTypes.bool,
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletStatement: {
        isGenerating: false,
    },
    preferredLocale: CONST.LOCALES.DEFAULT,
};

function WalletStatementPage(props) {
    const yearMonth = lodashGet(props.route.params, 'yearMonth', null);

    useEffect(() => {
        const currentYearMonth = moment().format('YYYYMM');
        if (!yearMonth || yearMonth.length !== 6 || yearMonth > currentYearMonth) {
            Navigation.dismissModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we want this effect to run only on mount
    }, []);

    useEffect(() => {
        moment.locale(props.preferredLocale);
    }, [props.preferredLocale]);

    const processDownload = () => {
        if (props.walletStatement.isGenerating) {
            return;
        }

        if (props.walletStatement[yearMonth]) {
            // We already have a file URL for this statement, so we can download it immediately
            const downloadFileName = `Expensify_Statement_${yearMonth}.pdf`;
            const fileName = props.walletStatement[yearMonth];
            const pdfURL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}secure?secureType=pdfreport&filename=${fileName}&downloadName=${downloadFileName}`;
            fileDownload(pdfURL, downloadFileName);
            return;
        }

        Growl.show(props.translate('statementPage.generatingPDF'), CONST.GROWL.SUCCESS, 3000);
        User.generateStatementPDF(yearMonth);
    };

    const year = yearMonth.substring(0, 4) || moment().year();
    const month = yearMonth.substring(4) || moment().month();
    const monthName = moment(month, 'M').format('MMMM');
    const title = `${monthName} ${year} statement`;
    const url = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}statement.php?period=${yearMonth}`;

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton
                title={Str.recapitalize(title)}
                shouldShowDownloadButton={!props.network.isOffline || props.walletStatement.isGenerating}
                onDownloadButtonPress={processDownload}
            />
            <FullPageOfflineBlockingView>
                <WalletStatementModal statementPageURL={url} />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

WalletStatementPage.propTypes = propTypes;
WalletStatementPage.defaultProps = defaultProps;
WalletStatementPage.displayName = 'WalletStatementPage';

export default compose(
    withLocalize,
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
        walletStatement: {
            key: ONYXKEYS.WALLET_STATEMENT,
        },
    }),
    withNetwork(),
)(WalletStatementPage);
