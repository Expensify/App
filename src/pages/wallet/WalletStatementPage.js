import {format, getMonth, getYear} from 'date-fns';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import WalletStatementModal from '@components/WalletStatementModal';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import fileDownload from '@libs/fileDownload';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';
import * as User from '@userActions/User';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
        const currentYearMonth = format(new Date(), CONST.DATE.YEAR_MONTH_FORMAT);
        if (!yearMonth || yearMonth.length !== 6 || yearMonth > currentYearMonth) {
            Navigation.dismissModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we want this effect to run only on mount
    }, []);

    useEffect(() => {
        DateUtils.setLocale(props.preferredLocale);
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

    const year = yearMonth.substring(0, 4) || getYear(new Date());
    const month = yearMonth.substring(4) || getMonth(new Date());
    const monthName = format(new Date(year, month), CONST.DATE.MONTH_FORMAT);
    const title = `${monthName} ${year} statement`;
    const url = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}statement.php?period=${yearMonth}`;

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            includeSafeAreaPaddingBottom={false}
            testID={WalletStatementPage.displayName}
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
