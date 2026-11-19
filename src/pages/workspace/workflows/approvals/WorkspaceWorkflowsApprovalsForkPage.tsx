/**
 * Explains a workflow's approval forks: where approvers' employee settings, inherited from Expensify Classic, send some of
 * the reports that reach them instead of along the workflow. Removing the forks saves the workflow as approval workflow
 * rules, which send every report along the approvers the workflow shows.
 */
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useApprovalWorkflows from '@hooks/useApprovalWorkflows';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite, goBackFromInvalidPolicy, isPendingDeletePolicy, shouldHideDynamicExternalWorkflowPeople} from '@libs/PolicyUtils';
import {getApprovalForkDescription, hasApprovalWorkflowForks, isApprovalWorkflowLockedByIntegration} from '@libs/WorkflowUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import {removeApprovalWorkflowForks} from '@userActions/Workflow';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';
import {View} from 'react-native';

import ApprovalForkSteps from './ApprovalForkSteps';

type WorkspaceWorkflowsApprovalsForkPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_FORK>;

function WorkspaceWorkflowsApprovalsForkPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsForkPageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {approvalWorkflows, rulesCollection} = useApprovalWorkflows(policy);
    const {policyID, firstApproverEmail} = route.params;

    const approvalWorkflow = approvalWorkflows.find((workflow) => workflow.approvers.at(0)?.email === firstApproverEmail && hasApprovalWorkflowForks(workflow));
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const forks = (approvalWorkflow?.approvers ?? [])
        .filter((approver) => !!approver.forkBranches)
        .map((forkApprover) => ({email: forkApprover.email, lines: getApprovalForkDescription({forkApprover, currency, translate, formatPhoneNumber, convertToDisplayString})}));
    const hasMultipleForks = forks.length > 1;

    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) ||
        !canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS) ||
        isPendingDeletePolicy(policy) ||
        forks.length === 0 ||
        isApprovalWorkflowLockedByIntegration(policy) ||
        shouldHideDynamicExternalWorkflowPeople(policy);

    const removeForks = () => {
        if (!approvalWorkflow) {
            return;
        }

        Navigation.goBack(undefined, {
            afterTransition: () => {
                removeApprovalWorkflowForks({approvalWorkflow, policy, rules: rulesCollection});
            },
        });
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={WorkspaceWorkflowsApprovalsForkPage.displayName}
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    addBottomSafeAreaPadding
                >
                    <Header>
                        <Header.BackButton onPress={() => Navigation.goBack()} />
                        <Header.Title title={translate('workflowsApprovalForkPage.title')} />
                    </Header>
                    <ScrollView
                        style={styles.flex1}
                        contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}
                    >
                        <Text style={styles.mb6}>{translate('workflowsApprovalForkPage.description', {count: forks.length})}</Text>
                        {forks.map(({email, lines}, forkIndex) => (
                            <View key={email}>
                                {forkIndex > 0 && <View style={[styles.sectionDividerLine, styles.mv6]} />}
                                {hasMultipleForks && (
                                    <Text
                                        variant="labelStrong"
                                        style={styles.mb4}
                                    >
                                        {translate('workflowsApprovalForkPage.forkNumber', {number: forkIndex + 1})}
                                    </Text>
                                )}
                                <ApprovalForkSteps lines={lines} />
                            </View>
                        ))}
                    </ScrollView>
                    <FixedFooter addBottomSafeAreaPadding>
                        <Button
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_FORK_REMOVE}
                            size={CONST.BUTTON_SIZE.LARGE}
                            variant={CONST.BUTTON_VARIANT.DANGER}
                            onPress={removeForks}
                        >
                            <Button.Text>{hasMultipleForks ? translate('workflowsApprovalForkPage.removeForks') : translate('workflowsApprovalForkPage.removeFork')}</Button.Text>
                        </Button>
                    </FixedFooter>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsForkPage.displayName = 'WorkspaceWorkflowsApprovalsForkPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsForkPage);
