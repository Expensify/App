import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';

import useCardsList from '@hooks/useCardsList';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isExpensifyCard} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type DynamicCardPreferredWorkspacePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CARD_PREFERRED_WORKSPACE>;

function DynamicCardPreferredWorkspacePage({route}: DynamicCardPreferredWorkspacePageProps) {
    const {policyID, cardID, feed} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.CARD_PREFERRED_WORKSPACE.path);
    const goBack = () => Navigation.goBack(backPath, {compareParams: false});

    const [allBankCards] = useCardsList(feed);
    const card = allBankCards?.[cardID];

    const featureName = isExpensifyCard(card) ? CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED : CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED;
    const policyFeature = isExpensifyCard(card) ? CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD : CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={featureName}
            policyFeature={policyFeature}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="DynamicCardPreferredWorkspacePage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.card.preferredWorkspace.title')}
                    onBackButtonPress={goBack}
                />
                <View style={[styles.mh5, styles.mb3, styles.renderHTML, styles.flexRow]}>
                    <RenderHTML html={translate('workspace.card.preferredWorkspace.selectDescription', CONST.WORKSPACE_SUBMISSION_FREQUENCY_HELP_URL)} />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicCardPreferredWorkspacePage;
