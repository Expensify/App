import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type WorkspaceCompanyCardAddWorkEmailPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_ADD_WORK_EMAIL>;

function WorkspaceCompanyCardAddWorkEmailPage({route}: WorkspaceCompanyCardAddWorkEmailPageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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
            >
                <HeaderWithBackButton title={translate('workspace.companyCards.addWorkEmail')} />
                <View style={styles.flex1}>
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('workspace.companyCards.addWorkEmail')}</Text>
                    <Text style={[styles.mt2, styles.mb4, styles.ph5, styles.textSupporting]}>{translate('workspace.companyCards.addWorkEmailDescription')}</Text>
                </View>
                <FixedFooter
                    addBottomSafeAreaPadding
                    addOfflineIndicatorBottomSafeAreaPadding
                >
                    <Button
                        variant="success"
                        size={CONST.BUTTON_SIZE.LARGE}
                        // After the user adds their work email, the back button should take them to the feed selector to pick a feed again, not back to this now-stale prompt page.
                        onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHODS.path, ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID)))}
                    >
                        <Button.Text>{translate('onboarding.workEmail.addWorkEmail')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardAddWorkEmailPage;
