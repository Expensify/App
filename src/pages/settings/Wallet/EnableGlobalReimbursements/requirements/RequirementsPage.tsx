import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {getWiseKYCRequirements, getWiseKYCReviewEmbeddedLink} from '@userActions/BankAccounts/wise';
import {clearDraftValues} from '@userActions/FormActions';

import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WiseKYCRequirement} from '@src/types/onyx';

import React, {useEffect} from 'react';

import getWiseRequirementTitle from './getWiseRequirementTitle';

type RequirementsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_REQUIREMENTS>;

const STATE_KEYS: Record<string, TranslationPaths> = {
    NOT_PROVIDED: 'wiseKYC.state.NOT_PROVIDED',
    IN_REVIEW: 'wiseKYC.state.IN_REVIEW',
    VERIFIED: 'wiseKYC.state.VERIFIED',
};

function RequirementsPage({route}: RequirementsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const bankAccountID = Number(route.params.bankAccountID);
    const [requirements, requirementsResult] = useOnyx(ONYXKEYS.WISE_KYC_REQUIREMENTS);

    useEffect(() => {
        getWiseKYCRequirements(bankAccountID);
    }, [bankAccountID]);

    const openRequirement = (requirement: WiseKYCRequirement) => {
        if (requirement.hostedOnly) {
            getWiseKYCReviewEmbeddedLink(bankAccountID);
            Navigation.navigate(ROUTES.SETTINGS_WALLET_WISE_KYC_EMBEDDED.getRoute(bankAccountID));
            return;
        }
        clearDraftValues(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM);
        Navigation.navigate(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENT_FORM.getRoute(bankAccountID, requirement.key));
    };

    return (
        <ScreenWrapper
            testID="WiseKYCRequirementsPage"
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('wiseKYC.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            />
            {requirementsResult.status === 'loading' || requirements === undefined ? (
                <FullScreenLoadingIndicator />
            ) : (
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <Text style={[styles.ph5, styles.mb4, styles.textSupporting]}>{translate('wiseKYC.description')}</Text>
                    {(requirements ?? []).map((requirement) => {
                        const stateKey = STATE_KEYS[requirement.state];
                        return (
                            <MenuItemWithTopDescription
                                key={requirement.key}
                                title={getWiseRequirementTitle(requirement.key, translate)}
                                description={stateKey ? translate(stateKey) : requirement.state}
                                shouldShowRightIcon
                                onPress={() => openRequirement(requirement)}
                            />
                        );
                    })}
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}

export default RequirementsPage;
