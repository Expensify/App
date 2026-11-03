import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeStyles from '@hooks/useThemeStyles';

import {isEmailPublicDomain} from '@libs/LoginUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

type WorkspaceCompanyCardAddWorkEmailPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_ADD_WORK_EMAIL>;

function WorkspaceCompanyCardAddWorkEmailPage({route}: WorkspaceCompanyCardAddWorkEmailPageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const primaryContactMethod = usePrimaryContactMethod();
    const feedSelectorRoute = ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID);

    // The feed selector only opens this page while the primary contact method is public, so once that changes return to it, whichever way the user came back here
    useFocusEffect(() => {
        if (!primaryContactMethod || isEmailPublicDomain(primaryContactMethod)) {
            return;
        }
        Navigation.goBack(feedSelectorRoute);
    });

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="WorkspaceCompanyCardAddWorkEmailPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton title={translate('workspace.companyCards.addWorkEmail')} />
                <View style={styles.flex1}>
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('workspace.companyCards.addWorkEmail')}</Text>
                    <Text style={[styles.mt2, styles.mb4, styles.ph5, styles.textSupporting]}>{translate('workspace.companyCards.addWorkEmailDescription')}</Text>
                </View>
                <FixedFooter addBottomSafeAreaPadding>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHODS.path))}
                    >
                        <Button.Text>{translate('onboarding.workEmail.addWorkEmail')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardAddWorkEmailPage;
