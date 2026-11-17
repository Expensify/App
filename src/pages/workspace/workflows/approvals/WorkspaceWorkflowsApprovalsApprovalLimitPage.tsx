import AmountForm from '@components/AmountForm';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';
import UserPill from '@components/UserPill';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailsByEmail from '@hooks/usePersonalDetailsByEmail';
import useShouldUseApprovalWorkflowRules from '@hooks/useShouldUseApprovalWorkflowRules';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite, goBackFromInvalidPolicy, isPendingDeletePolicy, shouldHideDynamicExternalWorkflowPeople} from '@libs/PolicyUtils';
import {isApprovalWorkflowLockedByIntegration, isOptionalOverLimitApprover} from '@libs/WorkflowUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';

import {callIfAuthenticated} from '@userActions/Session';
import {clearApprovalWorkflowApprover, removeApprovalWorkflowApprover, setApprovalWorkflowApprover, setApprovalWorkflowIsInitialFlow} from '@userActions/Workflow';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {authTokenTypeSelector} from '@src/selectors/Session';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {ValueOf} from 'type-fest';

import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';

type ApproverCondition = ValueOf<typeof CONST.APPROVAL_WORKFLOW.APPROVER_CONDITION>;

type WorkspaceWorkflowsApprovalsApprovalLimitPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVAL_LIMIT>;

function WorkspaceWorkflowsApprovalsApprovalLimitPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsApprovalLimitPageProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);
    const {translate, formatPhoneNumber} = useLocalize();
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const personalDetailsByEmail = usePersonalDetailsByEmail();
    const {getCurrencyDecimals, convertToDisplayString} = useCurrencyListActions();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    // Keep the removed approver on screen until navigation finishes, instead of the approver who moves up into their place
    const [removedApprover, setRemovedApprover] = useState<Approver>();
    const [editedCondition, setEditedCondition] = useState<ApproverCondition>();
    const [editedOverLimitAmount, setEditedOverLimitAmount] = useState<string>();
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const policyID = route.params.policyID;
    const shouldUseApprovalWorkflowRules = useShouldUseApprovalWorkflowRules(policy);
    const approverIndex = Number(route.params.approverIndex) || 0;
    const isEditFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT;
    // A newly picked approver gets the same steps as in a new workflow, even while an existing workflow is edited
    const isEditingApprover = isEditFlow && route.params.isAddingApprover !== 'true';
    const currentApprover = removedApprover ?? approvalWorkflow?.approvers?.[approverIndex];
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    // Every report reaches the first approver, so only an approver after them can skip some reports
    const isAdditionalApprover = approverIndex > 0 && !!currentApprover;

    const condition =
        editedCondition ?? (isOptionalOverLimitApprover(currentApprover) ? CONST.APPROVAL_WORKFLOW.APPROVER_CONDITION.OVER_AMOUNT : CONST.APPROVAL_WORKFLOW.APPROVER_CONDITION.ALWAYS);
    const isOverLimitApprover = isAdditionalApprover && condition === CONST.APPROVAL_WORKFLOW.APPROVER_CONDITION.OVER_AMOUNT;

    const defaultOverLimitAmount = currentApprover?.overLimitAmount;
    const overLimitAmount = editedOverLimitAmount ?? (defaultOverLimitAmount === undefined ? '' : convertToFrontendAmountAsString(defaultOverLimitAmount, getCurrencyDecimals(currency)));
    const hasOverLimitAmount = overLimitAmount.length > 0 && Number(overLimitAmount) > 0;
    const backendOverLimitAmount = convertToBackendAmount(Number.parseFloat(overLimitAmount));

    // Optional over-limit approvers in a row stack up, so a report only reaches one over a lower amount than the one before
    // it after it's over the higher amount anyway
    const previousOverLimitAmount = approverIndex > 0 ? approvalWorkflow?.approvers?.at(approverIndex - 1)?.overLimitAmount : undefined;
    const nextOverLimitAmount = approvalWorkflow?.approvers?.at(approverIndex + 1)?.overLimitAmount;
    let amountErrorKey: TranslationPaths | undefined;
    if (!hasOverLimitAmount) {
        amountErrorKey = 'workflowsApprovalLimitPage.enterAmountError';
    } else if (previousOverLimitAmount !== undefined && backendOverLimitAmount < previousOverLimitAmount) {
        amountErrorKey = 'workflowsPage.overLimitAmountBelowPreviousApprover';
    } else if (nextOverLimitAmount !== undefined && backendOverLimitAmount > nextOverLimitAmount) {
        amountErrorKey = 'workflowsPage.overLimitAmountAboveNextApprover';
    }
    const amountError = hasSubmitted && amountErrorKey ? translate(amountErrorKey) : undefined;
    const canWriteApprovals = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS);

    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) ||
        !canWriteApprovals ||
        isPendingDeletePolicy(policy) ||
        isApprovalWorkflowLockedByIntegration(policy) ||
        shouldHideDynamicExternalWorkflowPeople(policy);

    const approverDisplayName = Str.isSMSLogin(currentApprover?.displayName ?? '') ? formatPhoneNumber(currentApprover?.displayName ?? '') : (currentApprover?.displayName ?? '');
    const whenShouldApproveText = translate('workflowsApprovalLimitPage.whenShouldApprove', {approverName: approverDisplayName});
    const conditionOptions: Array<ListItem<ApproverCondition>> = [
        {
            text: translate('workflowsApprovalLimitPage.always'),
            keyForList: CONST.APPROVAL_WORKFLOW.APPROVER_CONDITION.ALWAYS,
            isSelected: condition === CONST.APPROVAL_WORKFLOW.APPROVER_CONDITION.ALWAYS,
        },
        {
            text: translate('workflowsApprovalLimitPage.overSetAmount'),
            keyForList: CONST.APPROVAL_WORKFLOW.APPROVER_CONDITION.OVER_AMOUNT,
            isSelected: condition === CONST.APPROVAL_WORKFLOW.APPROVER_CONDITION.OVER_AMOUNT,
        },
    ];

    const firstApprover = approvalWorkflow?.originalApprovers?.at(0)?.email ?? '';

    const navigateAfterCompletion = () => {
        if (isEditFlow) {
            // In edit mode, always go directly to the Edit page when saving.
            // Don't compare params: when the workflow was opened from "Add agent", the mounted edit
            // screen carries extra seed params, so a strict param match misses it and REPLACE mounts
            // a fresh edit screen that re-derives the workflow from the policy — wiping the unsaved
            // draft (the seeded agent and any in-progress edits). POP_TO returns to the live screen.
            Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyID, firstApprover, approvalWorkflow?.memberEmail), {compareParams: false});
            return;
        }
        // Mark that we've completed the initial wizard flow before navigating to the summary page
        setApprovalWorkflowIsInitialFlow(false);
        // Use forceReplace to replace the ApprovalLimit page in the navigation stack
        // so that when the user presses back from the Create page, they go to the Approver page
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID), {forceReplace: true});
    };

    const handleSubmit = () => {
        if (!approvalWorkflow) {
            return;
        }

        if (!currentApprover) {
            clearApprovalWorkflowApprover({approverIndex, currentApprovalWorkflow: approvalWorkflow});
            navigateAfterCompletion();
            return;
        }

        if (isOverLimitApprover && amountErrorKey) {
            setHasSubmitted(true);
            return;
        }

        setApprovalWorkflowApprover({
            approver: {...currentApprover, overLimitAmount: isOverLimitApprover ? backendOverLimitAmount : undefined},
            approverIndex,
            currentApprovalWorkflow: approvalWorkflow,
            policy,
            personalDetailsByEmail,
            shouldUseApprovalWorkflowRules,
        });
        navigateAfterCompletion();
    };

    const selectCondition = (selectedCondition: ApproverCondition) => {
        setEditedCondition(selectedCondition);
        setHasSubmitted(false);
    };

    const handleAmountChange = (value: string) => {
        setEditedOverLimitAmount(value);
        setHasSubmitted(false);
    };

    const removeApprover = () => {
        if (!approvalWorkflow) {
            return;
        }

        setRemovedApprover(currentApprover);
        removeApprovalWorkflowApprover({approverIndex, currentApprovalWorkflow: approvalWorkflow});
        navigateAfterCompletion();
    };

    const navigateToApproverChange = () => {
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER_CHANGE.getRoute(policyID, approverIndex));
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
                testID={WorkspaceWorkflowsApprovalsApprovalLimitPage.displayName}
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    addBottomSafeAreaPadding
                >
                    <HeaderWithBackButton
                        title={isEditingApprover ? translate('workflowsPage.approver') : translate('workflowsCreateApprovalsPage.additionalApprover')}
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <ScrollView
                        style={styles.flex1}
                        contentContainerStyle={styles.flexGrow1}
                    >
                        {isEditingApprover && (
                            <View style={styles.mh5}>
                                <MenuItemSectionRoot
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_LIMIT_APPROVER}
                                    accessibilityLabel={approverDisplayName}
                                    onPress={callIfAuthenticated(navigateToApproverChange, session)}
                                >
                                    <MenuItem.Row>
                                        <MenuItemField.Content name={translate('workflowsPage.approver')}>
                                            {!!currentApprover && (
                                                <View style={styles.pr3}>
                                                    <UserPill
                                                        avatar={currentApprover.avatar}
                                                        displayName={currentApprover.displayName}
                                                        email={currentApprover.email}
                                                        style={styles.userPillStandalone}
                                                    />
                                                </View>
                                            )}
                                        </MenuItemField.Content>
                                        <MenuItem.Trailing>
                                            <MenuItem.Chevron />
                                        </MenuItem.Trailing>
                                    </MenuItem.Row>
                                </MenuItemSectionRoot>
                            </View>
                        )}

                        {isAdditionalApprover && (
                            <>
                                {isEditingApprover ? (
                                    <>
                                        <View style={styles.dividerLine} />
                                        <Text style={[styles.textSupporting, styles.mh5, styles.mv3]}>{whenShouldApproveText}</Text>
                                    </>
                                ) : (
                                    <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{whenShouldApproveText}</Text>
                                )}
                                {conditionOptions.map((option) => (
                                    <SingleSelectListItem
                                        key={option.keyForList}
                                        item={option}
                                        showTooltip={false}
                                        onSelectRow={() => selectCondition(option.keyForList)}
                                    />
                                ))}
                                {isOverLimitApprover && (
                                    <View style={[styles.mh5, styles.mt3]}>
                                        <AmountForm
                                            label={translate('workflowsApprovalLimitPage.reportTotal')}
                                            currency={currency}
                                            value={overLimitAmount}
                                            onInputChange={handleAmountChange}
                                            isCurrencyPressable={false}
                                            displayAsTextInput
                                            errorText={amountError}
                                            onSubmitEditing={handleSubmit}
                                            // Only when the admin just picked the condition, so opening the page doesn't bring up the keyboard
                                            autoFocus={!!editedCondition}
                                        />
                                        {!amountError && hasOverLimitAmount && (
                                            <FormHelpMessage
                                                isError={false}
                                                message={translate('workflowsApprovalLimitPage.approvesOverAmount', {
                                                    approverName: approverDisplayName,
                                                    amount: convertToDisplayString(backendOverLimitAmount, currency),
                                                })}
                                            />
                                        )}
                                    </View>
                                )}
                            </>
                        )}

                        {isEditingApprover && isAdditionalApprover && (
                            <>
                                <View style={styles.dividerLine} />
                                <View style={styles.mh5}>
                                    <MenuItemSectionRoot
                                        onPress={removeApprover}
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.REMOVE_APPROVER}
                                    >
                                        <MenuItem.Row>
                                            <MenuItem.Leading>
                                                <MenuItem.Icon src={icons.Trashcan} />
                                            </MenuItem.Leading>
                                            <MenuItem.Content>
                                                <MenuItem.Title>{translate('workflowsApprovalLimitPage.removeApprover')}</MenuItem.Title>
                                            </MenuItem.Content>
                                        </MenuItem.Row>
                                    </MenuItemSectionRoot>
                                </View>
                            </>
                        )}
                    </ScrollView>

                    <FixedFooter addBottomSafeAreaPadding>
                        <Button
                            sentryLabel={isEditingApprover ? CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_LIMIT_SAVE : CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_LIMIT_NEXT}
                            size={CONST.BUTTON_SIZE.LARGE}
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            onPress={handleSubmit}
                        >
                            <Button.Text>{isEditingApprover ? translate('common.save') : translate('workflowsApprovalLimitPage.next')}</Button.Text>
                        </Button>
                    </FixedFooter>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsApprovalLimitPage.displayName = 'WorkspaceWorkflowsApprovalsApprovalLimitPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsApprovalLimitPage);
