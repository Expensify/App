import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
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
    const termsPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_MORE_INFO_NEEDED.path);
    const [embeddedLink] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK);

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['UserShield']);

    const goBackToTerms = () => Navigation.goBack(termsPath);

    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToTerms();
    }, [isWiseReimbursementsBetaEnabled, goBackToTerms]);

    // Only a link asked for on this visit redirects, so a fetch that returns after an earlier visit closed does not
    const [hasRequestedLink, setHasRequestedLink] = useState(false);
    const kycReviewURL = embeddedLink?.url;
    useEffect(() => {
        if (!hasRequestedLink || !kycReviewURL) {
            return;
        }
        openExternalLink(kycReviewURL, undefined, true);
    }, [hasRequestedLink, kycReviewURL]);

    // The link carries a token, so it does not outlive the page
    useEffect(() => () => clearWiseKYCReviewEmbeddedLink(), []);

    if (!isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <ScreenWrapper testID="WiseMoreInfoNeededPage">
            <Header>
                <Header.BackButton onPress={goBackToTerms} />
                <Header.Title title={translate('walletPage.wiseOnboarding.moreInfoNeeded.headerTitle')} />
            </Header>
            <ConfirmationPage>
                <ConfirmationPage.Content>
                    <ConfirmationPage.Illustration illustration={illustrations.UserShield} />
                    <ConfirmationPage.Heading>{translate('walletPage.wiseOnboarding.moreInfoNeeded.title')}</ConfirmationPage.Heading>
                    <ConfirmationPage.Description style={styles.textSupporting}>{translate('walletPage.wiseOnboarding.moreInfoNeeded.subtitle')}</ConfirmationPage.Description>
                </ConfirmationPage.Content>
                <FixedFooter>
                    {!!embeddedLink?.errors && (
                        <FormHelpMessage
                            message={getLatestErrorMessage(embeddedLink)}
                            style={styles.mb3}
                        />
                    )}
                    {/* A read is not queued offline, so the link can only be fetched online */}
                    <ConfirmationPage.PrimaryButton
                        text={translate('common.continue')}
                        isDisabled={isOffline}
                        isLoading={!!embeddedLink?.isLoading}
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
