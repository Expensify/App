import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type WorkspaceAgentsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.AGENTS>;
function WorkspaceAgentsPage({route}: WorkspaceAgentsPageProps) {
    const policy = usePolicy(route.params.policyID);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const isCompanyAgentsBetaEnabled = isBetaEnabled(CONST.BETAS.COMPANY_AGENTS);

    useWorkspaceDocumentTitle(policy?.name, 'workspace.agents.title');

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.AGENTS}
            shouldBeBlocked={!isCompanyAgentsBetaEnabled}
        >
            <WorkspacePageWithSections
                shouldUseScrollView
                headerText={translate('workspace.agents.title')}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                addBottomSafeAreaPadding
                policyFeature={CONST.POLICY.POLICY_FEATURE.AGENTS}
            >
                {(policyID?: string) => <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}></View>}
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceAgentsPage;
