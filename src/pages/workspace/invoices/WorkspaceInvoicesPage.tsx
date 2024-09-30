import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceInvoicesNoVBAView from './WorkspaceInvoicesNoVBAView';
import WorkspaceInvoicesVBAView from './WorkspaceInvoicesVBAView';
import WorkspaceInvoiceVBASection from './WorkspaceInvoiceVBASection';

type WorkspaceInvoicesPageProps = PlatformStackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES>;

function WorkspaceInvoicesPage({route}: WorkspaceInvoicesPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
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
                    {policyID && <WorkspaceInvoiceVBASection policyID={policyID} />}
                    {!hasVBA && policyID && <WorkspaceInvoicesNoVBAView policyID={policyID} />}
                    {hasVBA && policyID && <WorkspaceInvoicesVBAView policyID={policyID} />}
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceInvoicesPage.displayName = 'WorkspaceInvoicesPage';

export default WorkspaceInvoicesPage;
