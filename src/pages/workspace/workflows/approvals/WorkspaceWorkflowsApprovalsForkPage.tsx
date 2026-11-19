/**
 * Explains an approval fork: where an approver's employee settings, inherited from Expensify Classic, send some of the
 * reports that reach them instead of along the workflow. Removing the workflow's forks saves it as approval workflow
 * rules, which send every report along the approvers the workflow shows.
 */
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import Header from '@components/Header';
import Icon from '@components/Icon';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useApprovalWorkflows from '@hooks/useApprovalWorkflows';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite, goBackFromInvalidPolicy, isPendingDeletePolicy, shouldHideDynamicExternalWorkflowPeople} from '@libs/PolicyUtils';
import {getApprovalForkDescription, hasApprovalWorkflowForks, isApprovalWorkflowLockedByIntegration} from '@libs/WorkflowUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import variables from '@styles/variables';

import {removeApprovalWorkflowForks} from '@userActions/Workflow';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';
import {View} from 'react-native';

type WorkspaceWorkflowsApprovalsForkPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_FORK>;

function WorkspaceWorkflowsApprovalsForkPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsForkPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, formatPhoneNumber} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons(['UserCheck']);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {showConfirmModal} = useConfirmModal();
    const {approvalWorkflows, rulesCollection} = useApprovalWorkflows(policy);
    const {policyID, firstApproverEmail, forkApproverEmail} = route.params;

    const approvalWorkflow = approvalWorkflows.find((workflow) => workflow.approvers.at(0)?.email === firstApproverEmail && hasApprovalWorkflowForks(workflow));
    const forkApprover = approvalWorkflow?.approvers.find((approver) => approver.email === forkApproverEmail && !!approver.forkBranches);
    const forkCount = approvalWorkflow?.approvers.filter((approver) => !!approver.forkBranches).length ?? 0;
    const descriptionLines = forkApprover
        ? getApprovalForkDescription({forkApprover, currency: policy?.outputCurrency ?? CONST.CURRENCY.USD, translate, formatPhoneNumber, convertToDisplayString})
        : [];

    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) ||
        !canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS) ||
        isPendingDeletePolicy(policy) ||
        !forkApprover ||
        isApprovalWorkflowLockedByIntegration(policy) ||
        shouldHideDynamicExternalWorkflowPeople(policy);

    const removeForks = async () => {
        if (!approvalWorkflow) {
            return;
        }

        // Rules can't keep any of the workflow's forks, so removing one removes the others too, which the admin confirms
        if (forkCount > 1) {
            const result = await showConfirmModal({
                title: translate('workflowsApprovalForkPage.removeForksTitle'),
                prompt: translate('workflowsApprovalForkPage.removeForksPrompt'),
                confirmText: translate('workflowsApprovalForkPage.removeForks'),
                cancelText: translate('common.cancel'),
                buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
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
                        <Text style={styles.mb6}>{translate('workflowsApprovalForkPage.description')}</Text>
                        {descriptionLines.map((line, index) => (
                            <View key={line}>
                                {index > 0 && <View style={styles.workflowApprovalVerticalLine} />}
                                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                    <View style={styles.popoverMenuIcon}>
                                        <Icon
                                            src={icons.UserCheck}
                                            fill={theme.icon}
                                            width={variables.iconSizeNormal}
                                            height={variables.iconSizeNormal}
                                        />
                                    </View>
                                    <View style={[styles.flex1, styles.ml3]}>
                                        <RenderHTML html={line} />
                                    </View>
                                </View>
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
                            <Button.Text>{forkCount > 1 ? translate('workflowsApprovalForkPage.removeForks') : translate('workflowsApprovalForkPage.removeFork')}</Button.Text>
                        </Button>
                    </FixedFooter>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsForkPage.displayName = 'WorkspaceWorkflowsApprovalsForkPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsForkPage);
