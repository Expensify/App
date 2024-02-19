import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {FlatList, View} from 'react-native';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import ToggleSettingOptionRow from './ToggleSettingsOptionRow';
import type {OptionType} from './ToggleSettingsOptionRow';

type WorkspaceWorkflowsPageProps = WithPolicyProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

function WorkspaceWorkflowsPage({policy, route}: WorkspaceWorkflowsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    const items: OptionType[] = [
        {
            icon: Illustrations.ReceiptEnvelope,
            title: translate('workflowsPage.delaySubmissionTitle'),
            subtitle: translate('workflowsPage.delaySubmissionDescription'),
            onToggle: (isEnabled: boolean) => {
                Policy.setWorkspaceAutoReporting(route.params.policyID, isEnabled);
            },
            subMenuItems: (
                <MenuItem
                    title={translate('workflowsPage.submissionFrequency')}
                    titleStyle={styles.workspaceWorkflowsSubMenuTitle}
                    descriptionTextStyle={styles.workspaceWorkflowsSubMenuDescription}
                    description={translate('workflowsPage.weeklyFrequency')}
                    shouldShowRightIcon
                    wrapperStyle={styles.workspaceWorkflowsSubMenuContainer}
                    hoverAndPressStyle={[styles.mr0, styles.br2]}
                />
            ),
            hasBeenToggled: policy?.harvesting?.enabled ?? false,
        },
        {
            icon: Illustrations.Approval,
            title: translate('workflowsPage.addApprovalsTitle'),
            subtitle: translate('workflowsPage.addApprovalsDescription'),
            onToggle: (isEnabled: boolean) => {
                Policy.setWorkspaceApprovalMode(route.params.policyID, policy?.owner ?? '', isEnabled ? 'BASIC' : 'OPTIONAL');
            },
            subMenuItems: (
                <MenuItem
                    title={translate('workflowsPage.approver')}
                    titleStyle={styles.workspaceWorkflowsSubMenuTitle}
                    descriptionTextStyle={styles.workspaceWorkflowsSubMenuDescription}
                    description={policy?.owner ?? ''}
                    // onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVER.getRoute(route.params.policyID))}
                    shouldShowRightIcon
                    wrapperStyle={styles.workspaceWorkflowsSubMenuContainer}
                    hoverAndPressStyle={[styles.mr0, styles.br2]}
                />
            ),
            hasBeenToggled: policy?.isAutoApprovalEnabled ?? false,
        },
        {
            icon: Illustrations.WalletAlt,
            title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
            subtitle: translate('workflowsPage.makeOrTrackPaymentsDescription'),
            onToggle: () => {
                // TODO call API routes && set onyx optimistic data
            },
            subMenuItems: (
                <MenuItem
                    descriptionTextStyle={[styles.workspaceWorkflowsSubMenuDescription, styles.textSupporting]}
                    description={translate('workflowsPage.connectBankAccount')}
                    // onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_CONNECT_BANK_ACCOUNT.getRoute(route.params.policyID))}
                    shouldShowRightIcon
                    wrapperStyle={styles.workspaceWorkflowsSubMenuContainer}
                    hoverAndPressStyle={[styles.mr0, styles.br2]}
                />
            ),
            isEndOptionRow: true,
            hasBeenToggled: false, // TODO make it dynamic when VBBA action is implemented
        },
    ];

    const renderItem = ({item}: {item: OptionType}) => (
        <View style={styles.mt7}>
            <ToggleSettingOptionRow
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onToggle={item.onToggle}
                subMenuItems={item.subMenuItems}
                isEndOptionRow={item.isEndOptionRow}
                hasBeenToggled={item.hasBeenToggled}
            />
        </View>
    );

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.workflows')}
            icon={Illustrations.Workflows}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_WORKFLOWS}
            shouldShowOfflineIndicatorInWideScreen
        >
            {() => (
                <View style={[styles.mt3, styles.textStrong, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('workflowsPage.workflowTitle')}
                        titleStyles={styles.textStrong}
                        containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
                    >
                        <View>
                            <Text style={[styles.mt3, styles.textSupporting]}>{translate('workflowsPage.workflowDescription')}</Text>
                            <FlatList
                                data={items}
                                renderItem={renderItem}
                                keyExtractor={(item: OptionType) => item.title}
                            />
                        </View>
                    </Section>
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceWorkflowsPage.displayName = 'WorkspaceWorkflowsPage';

export default withPolicy(WorkspaceWorkflowsPage);
