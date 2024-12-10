import {format, getMonth, getYear} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import WalletStatementModal from '@components/WalletStatementModal';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useThemePreference from '@hooks/useThemePreference';
import DateUtils from '@libs/DateUtils';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import fileDownload from '@libs/fileDownload';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {addTrailingForwardSlash} from '@libs/Url';
import type {WalletStatementNavigatorParamList} from '@navigation/types';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WalletStatementPageProps = PlatformStackScreenProps<WalletStatementNavigatorParamList, typeof SCREENS.WALLET_STATEMENT_ROOT>;

function WalletStatementPage({route}: WalletStatementPageProps) {
    const [walletStatement] = useOnyx(ONYXKEYS.WALLET_STATEMENT);
    const themePreference = useThemePreference();
    const yearMonth = route.params.yearMonth ?? null;
    const isWalletStatementGenerating = walletStatement?.isGenerating ?? false;
    const prevIsWalletStatementGenerating = usePrevious(isWalletStatementGenerating);
    const [isDownloading, setIsDownloading] = useState(isWalletStatementGenerating);
    const {translate, preferredLocale} = useLocalize();
    const {environment} = useEnvironment();
    const {isOffline} = useNetwork();

    const baseURL = addTrailingForwardSlash(getOldDotURLFromEnvironment(environment));

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

    const processDownload = useCallback(() => {
        if (isWalletStatementGenerating) {
            return;
        }

        setIsDownloading(true);
        if (walletStatement?.[yearMonth]) {
            // We already have a file URL for this statement, so we can download it immediately
            const downloadFileName = `Expensify_Statement_${yearMonth}.pdf`;
            const fileName = walletStatement[yearMonth];
            const pdfURL = `${baseURL}secure?secureType=pdfreport&filename=${fileName}&downloadName=${downloadFileName}`;
            fileDownload(pdfURL, downloadFileName).finally(() => setIsDownloading(false));
            return;
        }

        User.generateStatementPDF(yearMonth);
    }, [baseURL, isWalletStatementGenerating, walletStatement, yearMonth]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        // If the statement generate is complete, download it automatically.
        if (prevIsWalletStatementGenerating && !isWalletStatementGenerating) {
            if (walletStatement?.[yearMonth]) {
                processDownload();
            } else {
                setIsDownloading(false);
            }
        }
    }, [prevIsWalletStatementGenerating, isWalletStatementGenerating, processDownload, walletStatement, yearMonth]);

    const year = yearMonth?.substring(0, 4) || getYear(new Date());
    const month = yearMonth?.substring(4) || getMonth(new Date());
    const monthName = format(new Date(Number(year), Number(month) - 1), CONST.DATE.MONTH_FORMAT);
    const title = translate('statementPage.title', {year, monthName});
    const url = `${baseURL}statement.php?period=${yearMonth}${themePreference === CONST.THEME.DARK ? '&isDarkMode=true' : ''}`;

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            includeSafeAreaPaddingBottom={false}
            testID={WalletStatementPage.displayName}
        >
            <HeaderWithBackButton
                title={Str.recapitalize(title)}
                shouldShowDownloadButton={!isOffline || isDownloading}
                isDownloading={isDownloading}
                onDownloadButtonPress={processDownload}
            />
            <FullPageOfflineBlockingView>
                <WalletStatementModal statementPageURL={url} />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

WalletStatementPage.displayName = 'WalletStatementPage';

export default WalletStatementPage;
