import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {getWiseKYCRequirements, getWiseKYCReviewEmbeddedLink} from '@userActions/BankAccounts/wise';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import isWiseDoneMessage from './isWiseDoneMessage';

/** The spinner while the link loads, or the fetch error when Wise's link could not be fetched */
function LinkPlaceholder({error}: {error: string}) {
    const styles = useThemeStyles();
    if (!error) {
        return <FullScreenLoadingIndicator />;
    }
    return (
        <View style={[styles.ph5, styles.mt3]}>
            <FormHelpMessage message={error} />
        </View>
    );
}

type EmbeddedWisePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_EMBEDDED>;

function EmbeddedWisePage({route}: EmbeddedWisePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const bankAccountID = Number(route.params.bankAccountID);
    const [embeddedLink] = useOnyx(ONYXKEYS.WISE_KYC_REVIEW_EMBEDDED_LINK);

    useEffect(() => {
        getWiseKYCReviewEmbeddedLink(bankAccountID);
    }, [bankAccountID]);

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (!isWiseDoneMessage(event.data)) {
                return;
            }
            getWiseKYCRequirements(bankAccountID);
            Navigation.goBack(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENTS.getRoute(bankAccountID));
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [bankAccountID]);

    return (
        <ScreenWrapper
            testID="EmbeddedWisePage"
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('wiseKYC.continueInWise')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENTS.getRoute(bankAccountID))}
            />
            {embeddedLink?.url ? (
                <iframe
                    title={translate('wiseKYC.continueInWise')}
                    src={embeddedLink.url}
                    style={styles.embeddedDemoIframe}
                    allow="camera; microphone"
                />
            ) : (
                <LinkPlaceholder error={getLatestErrorMessage(embeddedLink)} />
            )}
        </ScreenWrapper>
    );
}

export default EmbeddedWisePage;
