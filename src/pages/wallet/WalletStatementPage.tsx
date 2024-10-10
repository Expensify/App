import {format, getMonth, getYear} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WalletStatementModal from '@components/WalletStatementModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemePreference from '@hooks/useThemePreference';
import DateUtils from '@libs/DateUtils';
import fileDownload from '@libs/fileDownload';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WalletStatementNavigatorParamList} from '@navigation/types';
import * as User from '@userActions/User';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {WalletStatement} from '@src/types/onyx';

type WalletStatementOnyxProps = {
    walletStatement: OnyxEntry<WalletStatement>;
};

type WalletStatementPageProps = WalletStatementOnyxProps & PlatformStackScreenProps<WalletStatementNavigatorParamList, typeof SCREENS.WALLET_STATEMENT_ROOT>;

function WalletStatementPage({walletStatement, route}: WalletStatementPageProps) {
    const themePreference = useThemePreference();
    const yearMonth = route.params.yearMonth ?? null;
    const isWalletStatementGenerating = walletStatement?.isGenerating ?? false;

    const {translate, preferredLocale} = useLocalize();
    const {isOffline} = useNetwork();

    useEffect(() => {
        const currentYearMonth = format(new Date(), CONST.DATE.YEAR_MONTH_FORMAT);
        if (!yearMonth || yearMonth.length !== 6 || yearMonth > currentYearMonth) {
            Navigation.dismissModal();
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we want this effect to run only on mount
    }, []);

    useEffect(() => {
        DateUtils.setLocale(preferredLocale);
    }, [preferredLocale]);

    const processDownload = () => {
        if (isWalletStatementGenerating) {
            return;
        }

        if (walletStatement?.[yearMonth]) {
            // We already have a file URL for this statement, so we can download it immediately
            const downloadFileName = `Expensify_Statement_${yearMonth}.pdf`;
            const fileName = walletStatement[yearMonth];
            const pdfURL = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}secure?secureType=pdfreport&filename=${fileName}&downloadName=${downloadFileName}`;
            fileDownload(pdfURL, downloadFileName);
            return;
        }

        Growl.show(translate('statementPage.generatingPDF'), CONST.GROWL.SUCCESS, 3000);
        User.generateStatementPDF(yearMonth);
    };

    const year = yearMonth?.substring(0, 4) || getYear(new Date());
    const month = yearMonth?.substring(4) || getMonth(new Date());
    const monthName = format(new Date(Number(year), Number(month) - 1), CONST.DATE.MONTH_FORMAT);
    const title = translate('statementPage.title', {year, monthName});
    const url = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}statement.php?period=${yearMonth}${themePreference === CONST.THEME.DARK ? '&isDarkMode=true' : ''}`;

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            includeSafeAreaPaddingBottom={false}
            testID={WalletStatementPage.displayName}
        >
            <HeaderWithBackButton
                title={Str.recapitalize(title)}
                shouldShowDownloadButton={!isOffline || isWalletStatementGenerating}
                onDownloadButtonPress={processDownload}
            />
            <FullPageOfflineBlockingView>
                <WalletStatementModal statementPageURL={url} />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

WalletStatementPage.displayName = 'WalletStatementPage';

export default withOnyx<WalletStatementPageProps, WalletStatementOnyxProps>({
    walletStatement: {
        key: ONYXKEYS.WALLET_STATEMENT,
    },
})(WalletStatementPage);
