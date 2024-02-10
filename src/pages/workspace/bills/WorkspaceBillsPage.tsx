import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceBillsNoVBAView from './WorkspaceBillsNoVBAView';
import WorkspaceBillsVBAView from './WorkspaceBillsVBAView';

type WorkspaceBillsPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.BILLS>;

function WorkspaceBillsPage({route}: WorkspaceBillsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.bills')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BILLS}
            shouldShowOfflineIndicatorInWideScreen
        >
            {(hasVBA: boolean, policyID: string) => (
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {!hasVBA && <WorkspaceBillsNoVBAView policyID={policyID} />}
                    {hasVBA && <WorkspaceBillsVBAView policyID={policyID} />}
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceBillsPage.displayName = 'WorkspaceBillsPage';

export default WorkspaceBillsPage;
