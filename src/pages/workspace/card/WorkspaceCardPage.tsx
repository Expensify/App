import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceCardNoVBAView from './WorkspaceCardNoVBAView';
import WorkspaceCardVBANoECardView from './WorkspaceCardVBANoECardView';
import WorkspaceCardVBAWithECardView from './WorkspaceCardVBAWithECardView';

type WorkspaceCardPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.CARD>;

function WorkspaceCardPage({route}: WorkspaceCardPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.card')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_CARD}
            shouldShowOfflineIndicatorInWideScreen
        >
            {(hasVBA?: boolean, policyID?: string, isUsingECard?: boolean) => (
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {!hasVBA && <WorkspaceCardNoVBAView policyID={policyID ?? ''} />}

                    {hasVBA && !isUsingECard && <WorkspaceCardVBANoECardView />}

                    {hasVBA && isUsingECard && <WorkspaceCardVBAWithECardView />}
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceCardPage.displayName = 'WorkspaceCardPage';

export default WorkspaceCardPage;
