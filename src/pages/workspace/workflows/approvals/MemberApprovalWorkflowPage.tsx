/** Prevent saving Members workflow edits until the admin can see a confirmed destination and its affected members. */
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import Header from '@components/Header';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import TextLink from '@components/TextLink';

import useApprovalWorkflows from '@hooks/useApprovalWorkflows';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePressLoading from '@hooks/usePressLoading';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite, goBackFromInvalidPolicy, isControlPolicy, isPendingDeletePolicy, shouldHideDynamicExternalWorkflowPeople} from '@libs/PolicyUtils';
import {getApprovalWorkflowRulesForPolicy} from '@libs/RuleUtils';
import {extractSubmitterEmails, hasHiddenEmployeeRoutes, isApprovalWorkflowLockedByIntegration} from '@libs/WorkflowUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import {saveMemberApprovalWorkflow, validateApprovalWorkflow} from '@userActions/Workflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports -- the ref targets the native ScrollView in ApprovalWorkflowEditor
import type {ScrollView} from 'react-native';

import React, {useRef} from 'react';

import ApprovalWorkflowEditor from './ApprovalWorkflowEditor';

type MemberApprovalWorkflowPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT>;

function MemberApprovalWorkflowPage({policy, route}: MemberApprovalWorkflowPageProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const {rulesCollection, shouldUseApprovalWorkflowRules} = useApprovalWorkflows(policy);
    const {login = ''} = useCurrentUserPersonalDetails();
    const {isLoading, startWithLoading} = usePressLoading();
    const formRef = useRef<ComponentRef<typeof ScrollView>>(null);
    const context = approvalWorkflow?.memberWorkflow;
    const isCreate = context?.isConfirmed && !context.destination;
    const shouldShowNotFoundView =
        !policy ||
        !context ||
        context.policyID !== route.params.policyID ||
        context.member.email !== route.params.memberToMove ||
        !policy.employeeList?.[context.member.email] ||
        isPendingDeletePolicy(policy) ||
        !canMemberWrite(policy, login, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS) ||
        isApprovalWorkflowLockedByIntegration(policy) ||
        shouldHideDynamicExternalWorkflowPeople(policy);

    const saveWorkflow = async () => {
        if (shouldShowNotFoundView || !approvalWorkflow || !context?.isConfirmed || !validateApprovalWorkflow(approvalWorkflow)) {
            return;
        }
        if (isCreate && !isControlPolicy(policy)) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(
                    route.params.policyID,
                    CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias,
                    ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, route.params.firstApproverEmail, undefined, context.member.email),
                ),
            );
            return;
        }
        const destination = context.destination;
        const listedSubmitters = new Set(Object.values(getApprovalWorkflowRulesForPolicy(rulesCollection, route.params.policyID)).flatMap(extractSubmitterEmails));
        // Joining can convert a shared employee chain to rules, just like editing it from Workflows.
        if (
            shouldUseApprovalWorkflowRules &&
            destination &&
            !destination.members.some((member) => listedSubmitters.has(member.email)) &&
            hasHiddenEmployeeRoutes(destination.approvers, policy?.employeeList ?? {})
        ) {
            const result = await showConfirmModal({
                title: translate('workflowsEditApprovalsPage.hiddenRoutesTitle'),
                prompt: translate('workflowsEditApprovalsPage.hiddenRoutesPrompt'),
                confirmText: translate('common.save'),
                cancelText: translate('common.cancel'),
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
        }
        startWithLoading(() =>
            Navigation.goBack(undefined, {
                afterTransition: () => saveMemberApprovalWorkflow({approvalWorkflow, policy, rules: rulesCollection, shouldUseApprovalWorkflowRules}),
            }),
        );
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="MemberApprovalWorkflowPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                >
                    <Header>
                        <Header.BackButton onPress={Navigation.goBack} />
                        <Header.Title title={translate('workflowsEditApprovalsPage.title')} />
                    </Header>
                    {!!approvalWorkflow && (
                        <>
                            <ApprovalWorkflowEditor
                                approvalWorkflow={approvalWorkflow}
                                policy={policy}
                                policyID={route.params.policyID}
                                ref={formRef}
                            />
                            <FixedFooter addBottomSafeAreaPadding>
                                {!isEmptyObject(approvalWorkflow.errors) && (
                                    <FormHelpMessage
                                        isError
                                        message={translate('common.fixTheErrors')}
                                    >
                                        <TextLink
                                            onPress={() => formRef.current?.scrollTo({y: 0, animated: true})}
                                            sentryLabel={CONST.SENTRY_LABEL.FORM_ALERT_WRAPPER.FIX_ERRORS_LINK}
                                        >
                                            {translate('common.fixTheErrors')}
                                        </TextLink>
                                    </FormHelpMessage>
                                )}
                                <Button
                                    onPress={saveWorkflow}
                                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                                    size={CONST.BUTTON_SIZE.LARGE}
                                    isDisabled={!context?.isConfirmed}
                                    isLoading={isLoading}
                                    shouldShowLoadingImmediatelyOnPress={false}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVALS_EDIT_SAVE}
                                >
                                    <Button.KeyboardShortcut />
                                    <Button.Text>{translate(isCreate ? 'workflowsCreateApprovalsPage.submitButton' : 'common.save')}</Button.Text>
                                </Button>
                            </FixedFooter>
                        </>
                    )}
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default MemberApprovalWorkflowPage;
