import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import openExternalLink from '@libs/openExternalLink';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {clearWiseKYCReviewEmbeddedLink, getWiseKYCReviewEmbeddedLink} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect, useState} from 'react';

type WiseMoreInfoNeededPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_MORE_INFO_NEEDED>;

/** Sends the user to Wise's own page for the details only Wise can collect */
function WiseMoreInfoNeededPage({route}: WiseMoreInfoNeededPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const introPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_MORE_INFO_NEEDED.path);
    const entryPath = stripDynamicRouteSuffixFromPath(introPath, DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path);
    const [embeddedLink] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK);

    const {translate} = useLocalize();
    // A read lost to a dropped connection applies no failureData, so reconnecting clears the stuck loading state
    const {isOffline} = useNetwork({onReconnect: clearWiseKYCReviewEmbeddedLink});
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['UserShield']);

    // The flow is finished on our side, so back leaves it instead of reopening the form
    const goBackToEntryPoint = () => Navigation.goBack(entryPath);

    // The intro is the screen underneath, so Android's back takes the header's step instead of popping to it
    useAndroidBackButtonHandler(() => {
        goBackToEntryPoint();
        return true;
    });

    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToEntryPoint();
    }, [isWiseReimbursementsBetaEnabled, goBackToEntryPoint]);

    // Only a link asked for on this visit redirects, so a fetch that returns after an earlier visit closed does not
    const [hasRequestedLink, setHasRequestedLink] = useState(false);
    const kycReviewURL = embeddedLink?.url;
    useEffect(() => {
        if (!hasRequestedLink || !kycReviewURL) {
            return;
        }
        openExternalLink(kycReviewURL, undefined, true);
    }, [hasRequestedLink, kycReviewURL]);

    // The link carries a token and a fetch can land after an earlier visit closed, so the page drops it on open and on close
    useEffect(() => {
        clearWiseKYCReviewEmbeddedLink();
        return () => clearWiseKYCReviewEmbeddedLink();
    }, []);

    if (!isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <ScreenWrapper
            testID="WiseMoreInfoNeededPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <Header>
                <Header.BackButton onPress={goBackToEntryPoint} />
                <Header.Title title={translate('walletPage.wiseOnboarding.moreInfoNeeded.headerTitle')} />
            </Header>
            <ConfirmationPage>
                <ConfirmationPage.Content requestErrors={embeddedLink?.errors}>
                    <ConfirmationPage.Illustration illustration={illustrations.UserShield} />
                    <ConfirmationPage.Heading>{translate('walletPage.wiseOnboarding.moreInfoNeeded.title')}</ConfirmationPage.Heading>
                    <ConfirmationPage.Description style={styles.textSupporting}>{translate('walletPage.wiseOnboarding.moreInfoNeeded.subtitle')}</ConfirmationPage.Description>
                </ConfirmationPage.Content>
                <FixedFooter>
                    {/* A read is not queued offline, so the link can only be fetched online */}
                    <ConfirmationPage.PrimaryButton
                        text={translate('common.continue')}
                        isDisabled={isOffline}
                        isLoading={!!embeddedLink?.isLoading}
                        sentryLabel={CONST.SENTRY_LABEL.WISE_MORE_INFO_NEEDED.CONTINUE}
                        onPress={() => {
                            setHasRequestedLink(true);
                            getWiseKYCReviewEmbeddedLink(bankAccountID);
                        }}
                    />
                </FixedFooter>
            </ConfirmationPage>
        </ScreenWrapper>
    );
}

export default WiseMoreInfoNeededPage;
