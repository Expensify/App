import React from 'react';
import CardAuthenticationView from '@components/CardAuthenticationView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {clearPaymentCard3dsVerification, verifySetupIntent} from '@userActions/PaymentMethods';
import {verifySetupIntentAndRequestPolicyOwnerChange} from '@userActions/Policy/Policy';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicCardAuthenticationPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DYNAMIC_CARD_AUTHENTICATION>;

function DynamicCardAuthenticationPage({route}: DynamicCardAuthenticationPageProps) {
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.CARD_AUTHENTICATION.path);
    const {accountID: currentUserAccountID, email: currentUserEmail = ''} = useCurrentUserPersonalDetails();
    const policyID = route.params?.policyID;

    const onSuccess = () => {
        if (policyID) {
            verifySetupIntentAndRequestPolicyOwnerChange(policyID, currentUserAccountID, currentUserEmail);
            return;
        }
        verifySetupIntent(currentUserAccountID, true);
    };

    // Mirrors the original CardAuthenticationModal.onModalClose semantic:
    // user-driven close discards VERIFY_3DS_SUBSCRIPTION so the next mount
    // of an entry screen is fresh. Order (clear before goBack) is defensive
    // — even if isFocused were ever added back to the trigger hook's
    // useEffect deps, batching both updates into a single commit would
    // keep the parent's effect race-free.
    const onClose = () => {
        clearPaymentCard3dsVerification();
        Navigation.goBack(backPath);
    };

    return (
        <ScreenWrapper
            includePaddingTop={false}
            includeSafeAreaPaddingBottom={false}
            testID="DynamicCardAuthenticationPage"
        >
            <HeaderWithBackButton
                title={translate('subscription.authenticatePaymentCard')}
                shouldShowBorderBottom
                onBackButtonPress={onClose}
                shouldDisplayHelpButton={false}
            />
            <CardAuthenticationView
                onSuccess={onSuccess}
                onClose={onClose}
            />
        </ScreenWrapper>
    );
}

export default DynamicCardAuthenticationPage;
