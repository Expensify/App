import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import Text from '@components/Text';
import Section from '@components/Section';
import * as Illustrations from '@components/Icon/Illustrations';

type WorkspaceWorkflowsPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

function WorkspaceWorkflowsPage({route}: WorkspaceWorkflowsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.workflows')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_WORKFLOWS}
            shouldShowOfflineIndicatorInWideScreen
        >
            {(_, policyID: string) => (
                <View style={[styles.mt3, styles.textStrong, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section title={translate('workflowsPage.workflowTitle')} titleStyles={styles.textStrong}>
                        <View>
                            <Text style={[styles.mt3, styles.textSupporting]}>{translate('workflowsPage.workflowDescription')}</Text>
                            <View style={styles.mt7}>
                                <View style={styles.workspaceWorkflowsContainer}>
                                    <Illustrations.ReceiptEnvelope style={styles.workspaceWorkflowsIcon}/>
                                    <View style={styles.workspaceWorkflowsWrapperText}>
                                        <Text style={styles.workspaceWorkflowsHeading}>{translate('workflowsPage.delaySubmissionTitle')}</Text>
                                        <Text style={styles.workspaceWorkflowsSubtitle}>{translate('workflowsPage.delaySubmissionDescription')}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Section>
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceWorkflowsPage.displayName = 'WorkspaceWorkflowsPage';

export default WorkspaceWorkflowsPage;
