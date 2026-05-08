import {format, getMonth, getYear} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useEffect, useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import WalletStatementModal from '@components/WalletStatementModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemePreference from '@hooks/useThemePreference';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isMobileSafari} from '@libs/Browser';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import fileDownload from '@libs/fileDownload';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import addTrailingForwardSlash from '@libs/UrlUtils';
import type {WalletStatementNavigatorParamList} from '@navigation/types';
import {getBaseTheme} from '@styles/theme/utils';
import {generateStatementPDF} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WalletStatementPageProps = PlatformStackScreenProps<WalletStatementNavigatorParamList, typeof SCREENS.WALLET_STATEMENT_ROOT>;

function WalletStatementPage({route}: WalletStatementPageProps) {
    const [walletStatement] = useOnyx(ONYXKEYS.WALLET_STATEMENT);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();
    const {environment} = useEnvironment();
    const {isOffline} = useNetwork();
    const themePreference = useThemePreference();
    const session = useSession();

    const [isDownloading, setIsDownloading] = useState(false);

    const yearMonth = route.params.yearMonth ?? null;
    const year = yearMonth?.substring(0, 4) || getYear(new Date());
    const month = yearMonth?.substring(4) || getMonth(new Date());
    const monthName = format(new Date(Number(year), Number(month) - 1), CONST.DATE.MONTH_FORMAT);
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';
    const baseURL = addTrailingForwardSlash(getOldDotURLFromEnvironment(environment));
    const cachedFileName = yearMonth ? walletStatement?.[yearMonth] : undefined;
    const url = `${baseURL}statement.php?period=${yearMonth}${getBaseTheme(themePreference) === CONST.THEME.DARK ? '&isDarkMode=true' : ''}`;

    // Dismiss if the yearMonth route param is missing, malformed, or in the future
    useEffect(() => {
        const currentYearMonth = format(new Date(), CONST.DATE.YEAR_MONTH_FORMAT);
        if (yearMonth?.length !== 6 || yearMonth > currentYearMonth) {
            Navigation.dismissModal();
        }
    }, [yearMonth]);

    const processDownload = () => {
        if (isDownloading || !currentUserLogin || !yearMonth) {
            return;
        }
        setIsDownloading(true);

        const fileNamePromise = cachedFileName
            ? Promise.resolve(cachedFileName)
            : generateStatementPDF(yearMonth).then((response) => {
                  const statementUpdate = response?.onyxData?.find((update) => update.key === ONYXKEYS.WALLET_STATEMENT);
                  const value = statementUpdate?.value as Record<string, string> | undefined;
                  return value?.[yearMonth];
              });

        fileNamePromise
            .then((fileName) => {
                if (!fileName) {
                    return undefined;
                }
                const downloadFileName = `Expensify_Statement_${yearMonth}.pdf`;
                const pdfURL = `${baseURL}secure?secureType=pdfreport&filename=${encodeURIComponent(fileName)}&downloadName=${encodeURIComponent(downloadFileName)}&email=${encodeURIComponent(
                    currentUserLogin,
                )}`;
                return fileDownload(translate, addEncryptedAuthTokenToURL(pdfURL, encryptedAuthToken, true), downloadFileName, '', isMobileSafari());
            })
            .finally(() => {
                setIsDownloading(false);
            });
    };

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="WalletStatementPage"
        >
            <HeaderWithBackButton
                title={Str.recapitalize(translate('statementPage.title', year, monthName))}
                shouldShowDownloadButton={!isOffline || isDownloading}
                isDownloading={isDownloading}
                onDownloadButtonPress={processDownload}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                <WalletStatementModal statementPageURL={url} />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default WalletStatementPage;
