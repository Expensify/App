import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceInvoiceBalanceSection from './WorkspaceInvoiceBalanceSection';
import WorkspaceInvoicesNoVBAView from './WorkspaceInvoicesNoVBAView';
import WorkspaceInvoicesVBAView from './WorkspaceInvoicesVBAView';
import WorkspaceInvoiceVBASection from './WorkspaceInvoiceVBASection';

type WorkspaceInvoicesPageProps = StackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES>;

function WorkspaceInvoicesPage({route}: WorkspaceInvoicesPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED}
        >
            <WorkspacePageWithSections
                shouldUseScrollView
                headerText={translate('workspace.common.invoices')}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_INVOICES}
                shouldShowOfflineIndicatorInWideScreen
                shouldSkipVBBACall={false}
                route={route}
            >
                {(hasVBA?: boolean, policyID?: string) => (
                    <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        {policyID && <WorkspaceInvoiceBalanceSection policyID={policyID} />}
                        {policyID && <WorkspaceInvoiceVBASection policyID={policyID} />}
                        {!hasVBA && policyID && <WorkspaceInvoicesNoVBAView policyID={policyID} />}
                        {hasVBA && policyID && <WorkspaceInvoicesVBAView policyID={policyID} />}
                    </View>
                )}
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInvoicesPage.displayName = 'WorkspaceInvoicesPage';

export default WorkspaceInvoicesPage;
