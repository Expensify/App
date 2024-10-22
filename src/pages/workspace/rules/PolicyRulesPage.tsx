import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Illustrations from '@src/components/Icon/Illustrations';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import ExpenseReportRulesSection from './ExpenseReportRulesSection';
import IndividualExpenseRulesSection from './IndividualExpenseRulesSection';

type PolicyRulesPageProps = StackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RULES>;

function PolicyRulesPage({route}: PolicyRulesPageProps) {
    const {translate} = useLocalize();
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {canUseWorkspaceRules} = usePermissions();

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <WorkspacePageWithSections
                testID={PolicyRulesPage.displayName}
                shouldUseScrollView
                headerText={translate('workspace.common.rules')}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_RULES}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                icon={Illustrations.Rules}
                shouldShowNotFoundPage={!canUseWorkspaceRules}
                shouldShowLoading={false}
            >
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <IndividualExpenseRulesSection policyID={policyID} />
                    <ExpenseReportRulesSection policyID={policyID} />
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

PolicyRulesPage.displayName = 'PolicyRulesPage';

export default PolicyRulesPage;
