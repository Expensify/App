import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {FlatList, View} from 'react-native';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import ToggleSettingOptionRow from './ToggleSettingsOptionRow';
import type {ToggleSettingOptionRowProps} from './ToggleSettingsOptionRow';

type WorkspaceWorkflowsPageProps = WithPolicyProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

function WorkspaceWorkflowsPage({policy, route}: WorkspaceWorkflowsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();

    const ownerPersonalDetails = ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs([policy?.ownerAccountID ?? 0], CONST.EMPTY_OBJECT), false);
    const policyOwnerDisplayName = ownerPersonalDetails[0]?.displayName;
    const containerStyle = useMemo(() => [styles.ph8, styles.mhn8, styles.ml11, styles.pv3, styles.pr0, styles.pl4, styles.mr0, styles.widthAuto, styles.mt4], [styles]);

    const items: ToggleSettingOptionRowProps[] = useMemo(
        () => [
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
                        titleStyle={styles.textLabelSupportingNormal}
                        descriptionTextStyle={styles.textNormalThemeText}
                        // onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY).getRoute(route.params.policyID))}
                        // TODO will be done in https://github.com/Expensify/Expensify/issues/368332
                        description={translate('workflowsPage.weeklyFrequency')}
                        shouldShowRightIcon
                        wrapperStyle={containerStyle}
                        hoverAndPressStyle={[styles.mr0, styles.br2]}
                    />
                ),
                isActive: policy?.harvesting?.enabled ?? false,
                pendingAction: policy?.pendingFields?.isAutoApprovalEnabled,
            },
            {
                icon: Illustrations.Approval,
                title: translate('workflowsPage.addApprovalsTitle'),
                subtitle: translate('workflowsPage.addApprovalsDescription'),
                onToggle: (isEnabled: boolean) => {
                    Policy.setWorkspaceApprovalMode(route.params.policyID, policy?.owner ?? '', isEnabled ? CONST.POLICY.APPROVAL_MODE.BASIC : CONST.POLICY.APPROVAL_MODE.OPTIONAL);
                },
                subMenuItems: (
                    <MenuItem
                        title={translate('workflowsPage.approver')}
                        titleStyle={styles.textLabelSupportingNormal}
                        descriptionTextStyle={styles.textNormalThemeText}
                        description={policyOwnerDisplayName ?? ''}
                        // onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVER.getRoute(route.params.policyID))}
                        // TODO will be done in https://github.com/Expensify/Expensify/issues/368334
                        shouldShowRightIcon
                        wrapperStyle={containerStyle}
                        hoverAndPressStyle={[styles.mr0, styles.br2]}
                    />
                ),
                isActive: policy?.isAutoApprovalEnabled ?? false,
                pendingAction: policy?.pendingFields?.approvalMode,
            },
            {
                icon: Illustrations.WalletAlt,
                title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
                subtitle: translate('workflowsPage.makeOrTrackPaymentsDescription'),
                onToggle: () => {
                    // TODO will be done in https://github.com/Expensify/Expensify/issues/368335
                },
                subMenuItems: (
                    <MenuItem
                        descriptionTextStyle={
                            isOffline ? StyleUtils.getWorkspaceWorkflowsOfflineDescriptionStyle([styles.textNormal, styles.textSupporting]) : [styles.textNormal, styles.textSupporting]
                        }
                        description={translate('workflowsPage.connectBankAccount')}
                        // onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_CONNECT_BANK_ACCOUNT.getRoute(route.params.policyID))}
                        // TODO will be done in https://github.com/Expensify/Expensify/issues/368335
                        shouldShowRightIcon
                        wrapperStyle={containerStyle}
                        hoverAndPressStyle={[styles.mr0, styles.br2]}
                    />
                ),
                isEndOptionRow: true,
                isActive: false, // TODO will be done in https://github.com/Expensify/Expensify/issues/368335
            },
        ],
        [policy, route.params.policyID, styles, translate, policyOwnerDisplayName, containerStyle, isOffline, StyleUtils],
    );

    const renderItem = ({item}: {item: ToggleSettingOptionRowProps}) => (
        <View style={styles.mt7}>
            <ToggleSettingOptionRow
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onToggle={item.onToggle}
                subMenuItems={item.subMenuItems}
                isActive={item.isActive}
                pendingAction={item.pendingAction}
            />
        </View>
    );

    const isPaidGroupPolicy = PolicyUtils.isPaidGroupPolicy(policy);
    const isPolicyAdmin = PolicyUtils.isPolicyAdmin(policy);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.common.workflows')}
            icon={Illustrations.Workflows}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_WORKFLOWS}
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNotFoundPage={!isPaidGroupPolicy || !isPolicyAdmin}
        >
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
                            keyExtractor={(item: ToggleSettingOptionRowProps) => item.title}
                        />
                    </View>
                </Section>
            </View>
        </WorkspacePageWithSections>
    );
}

WorkspaceWorkflowsPage.displayName = 'WorkspaceWorkflowsPage';

export default withPolicy(WorkspaceWorkflowsPage);
