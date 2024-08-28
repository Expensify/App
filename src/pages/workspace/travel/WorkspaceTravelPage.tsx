import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceTravelNoVBAView from './WorkspaceTravelNoVBAView';
import WorkspaceTravelVBAView from './WorkspaceTravelVBAView';

type WorkspaceTravelPageProps = PlatformStackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL>;

function WorkspaceTravelPage({route}: WorkspaceTravelPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.travel')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_TRAVEL}
            shouldShowOfflineIndicatorInWideScreen
            shouldSkipVBBACall={false}
        >
            {(hasVBA, policyID) => (
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {!hasVBA && <WorkspaceTravelNoVBAView policyID={policyID} />}
                    {hasVBA && <WorkspaceTravelVBAView />}
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceTravelPage.displayName = 'WorkspaceTravelPage';

export default WorkspaceTravelPage;
