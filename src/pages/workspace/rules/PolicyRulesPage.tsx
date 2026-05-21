import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {openPolicyRulesPage} from '@libs/actions/Policy/Rules';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import IndividualExpenseRulesSection from './IndividualExpenseRulesSection';
import MerchantRulesSection from './MerchantRulesSection';
import SpendRulesSection from './SpendRules/SpendRulesSection';

type PolicyRulesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RULES>;

function PolicyRulesPage({route}: PolicyRulesPageProps) {
    const {translate} = useLocalize();
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rules');
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['Rules']);
    const {canWrite: canWriteRules, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);

    const fetchRules = useCallback(() => {
        openPolicyRulesPage(policyID);
    }, [policyID]);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
        >
            <WorkspacePageWithSections
                testID="PolicyRulesPage"
                shouldUseScrollView
                headerText={translate('workspace.common.rules')}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                icon={illustrations.Rules}
                policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
                shouldShowNotFoundPage={false}
                shouldShowLoading={false}
                addBottomSafeAreaPadding
            >
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <IndividualExpenseRulesSection
                        policyID={policyID}
                        canWriteRules={canWriteRules}
                        showReadOnlyModal={showReadOnlyModal}
                    />
                    <MerchantRulesSection
                        policyID={policyID}
                        canWriteRules={canWriteRules}
                    />
                    {!!policy?.areExpensifyCardsEnabled && (
                        <SpendRulesSection
                            policyID={policyID}
                            canWriteRules={canWriteRules}
                        />
                    )}
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyRulesPage;
