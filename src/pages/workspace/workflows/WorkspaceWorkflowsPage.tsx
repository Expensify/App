import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {FlatList, View} from 'react-native';
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
import ToggleSettingOptionRow, { OptionType } from './ToggleSettingsOptionRow';
import MenuItem from '@components/MenuItem';
import compose from '@libs/compose';
import withPolicy, {WithPolicyProps} from '@pages/workspace/withPolicy';
import * as Policy from '@userActions/Policy';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type WorkspaceWorkflowsPageProps = WithPolicyProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

function WorkspaceWorkflowsPage({policy, route}: WorkspaceWorkflowsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    const items: OptionType[] = [
        {
          Illustration: Illustrations.ReceiptEnvelope, // Replace with actual component
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
                // onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(route.params.policyID))}
                shouldShowRightIcon={true}
                wrapperStyle={styles.workspaceWorkflowsSubMenuContainer}
                />
          ),
        },
        {
            Illustration: Illustrations.Approval,
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
                shouldShowRightIcon={true}
                wrapperStyle={styles.workspaceWorkflowsSubMenuContainer}
              />
            ),
          },
          {
            Illustration: Illustrations.WalletAlt,
            title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
            subtitle: translate('workflowsPage.makeOrTrackPaymentsDescription'),
            onToggle: (isEnabled: boolean) => {
              // TODO call API routes && set onyx optimistic data
            },
            subMenuItems: (
                <MenuItem
                descriptionTextStyle={[styles.workspaceWorkflowsSubMenuDescription, styles.textSupporting]}
                description={translate('workflowsPage.connectBankAccount')}
                // onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_CONNECT_BANK_ACCOUNT.getRoute(route.params.policyID))}
                shouldShowRightIcon={true}
                wrapperStyle={styles.workspaceWorkflowsSubMenuContainer}
              />
            ),
            isEndOptionRow: true,
          },
    ];

    const renderItem = ({ item }: { item: OptionType }) => (
        <View style={styles.mt7}>
             <ToggleSettingOptionRow
                Illustration={item.Illustration}
                title={item.title}
                subtitle={item.subtitle}                    
                onToggle={item.onToggle}
                subMenuItems={item.subMenuItems}
                isEndOptionRow={item.isEndOptionRow}
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
            {(_, policyID: string) => (
                <View style={[styles.mt3, styles.textStrong, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section title={translate('workflowsPage.workflowTitle')} titleStyles={styles.textStrong} containerStyles={styles.p8}>
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

export default compose(
    withPolicy,
)(WorkspaceWorkflowsPage);
