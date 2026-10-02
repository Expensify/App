import AmountForm from '@components/AmountForm';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import Header from '@components/Header';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import UserPill from '@components/UserPill';

import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalDetailsByEmail from '@hooks/usePersonalDetailsByEmail';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite, goBackFromInvalidPolicy, isPendingDeletePolicy, shouldHideDynamicExternalWorkflowPeople} from '@libs/PolicyUtils';
import {getApprovalLimitGroups, getApprovalLimitLoopApprover, getApprovalLimitShortName, isApprovalWorkflowLockedByIntegration} from '@libs/WorkflowUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';

import {setApprovalLimit, updateApprovalLimit} from '@userActions/Workflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type WorkspaceWorkflowsApprovalsApprovalLimitPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVAL_LIMIT>;

function WorkspaceWorkflowsApprovalsApprovalLimitPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsApprovalLimitPageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);
    const [approvalLimitDraft, approvalLimitDraftMetadata] = useOnyx(ONYXKEYS.APPROVAL_LIMIT);
    const isApprovalLimitDraftLoading = isLoadingOnyxValue(approvalLimitDraftMetadata);
    const personalDetailsByEmail = usePersonalDetailsByEmail();
    const {getCurrencyDecimals, convertToDisplayString} = useCurrencyListActions();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();

    const policyID = route.params.policyID;
    const approverEmail = route.params.approverEmail;
    const isEditFlow = !!approverEmail;
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const employees = policy?.employeeList ?? {};

    const [editedApprovalLimit, setEditedApprovalLimit] = useState<string>();
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const approvalLimitGroup = isEditFlow
        ? getApprovalLimitGroups({employees, personalDetailsByEmail: personalDetailsByEmail ?? {}, localeCompare}).find((group) => group.approvers.includes(approverEmail))
        : undefined;

    const canWriteApprovals = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS);
    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) ||
        !canWriteApprovals ||
        isPendingDeletePolicy(policy) ||
        (isEditFlow && !approvalLimitGroup && !approvalLimitDraft?.originalApprovers.includes(approverEmail)) ||
        isApprovalWorkflowLockedByIntegration(policy) ||
        shouldHideDynamicExternalWorkflowPeople(policy) ||
        isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS);

    // Seed the draft when the page is opened. Sub-pages write into it, so keep it when returning from one of them.
    useEffect(() => {
        if (isApprovalLimitDraftLoading) {
            return;
        }

        const isResumingDraft = isEditFlow ? !!approvalLimitDraft?.originalApprovers.includes(approverEmail) : !!approvalLimitDraft && approvalLimitDraft.originalApprovers.length === 0;
        if (isResumingDraft) {
            return;
        }

        if (isEditFlow && !approvalLimitGroup) {
            return;
        }

        setApprovalLimit({
            approvers: approvalLimitGroup?.approvers ?? [],
            approvalLimit: approvalLimitGroup ? convertToFrontendAmountAsString(approvalLimitGroup.approvalLimit, getCurrencyDecimals(currency)) : '',
            overLimitForwardsTo: approvalLimitGroup?.overLimitForwardsTo ?? '',
            originalApprovers: approvalLimitGroup?.approvers ?? [],
        });
    }, [isApprovalLimitDraftLoading, approvalLimitDraft, isEditFlow, approverEmail, approvalLimitGroup, currency, getCurrencyDecimals]);

    const approvers = approvalLimitDraft?.approvers ?? [];
    const originalApprovers = approvalLimitDraft?.originalApprovers ?? [];
    const overLimitForwardsTo = approvalLimitDraft?.overLimitForwardsTo ?? '';
    const approvalLimit = editedApprovalLimit ?? approvalLimitDraft?.approvalLimit ?? '';

    const hasApprovers = approvers.length > 0;
    const hasAmount = approvalLimit.length > 0 && Number(approvalLimit) > 0;
    const hasOverLimitApprover = overLimitForwardsTo.length > 0;
    const limitInCents = hasAmount ? convertToBackendAmount(Number.parseFloat(approvalLimit)) : 0;
    const loopApproverEmail =
        hasApprovers && hasAmount && hasOverLimitApprover
            ? getApprovalLimitLoopApprover({employees, approvers, approvalLimit: limitInCents, overLimitForwardsTo, originalApprovers})
            : undefined;

    const getDisplayName = (email: string) => formatPhoneNumber(personalDetailsByEmail?.[email]?.displayName ?? email);

    const approverErrorText = hasSubmitted && !hasApprovers ? translate('common.error.fieldRequired') : undefined;
    const amountErrorText = hasSubmitted && !hasAmount ? translate('workflowsApprovalLimitPage.enterAmountError') : undefined;
    const getOverLimitApproverErrorText = () => {
        if (!hasSubmitted) {
            return undefined;
        }
        if (!hasOverLimitApprover) {
            return translate('common.error.fieldRequired');
        }
        if (loopApproverEmail) {
            return translate('workflowsApprovalLimitPage.loopError', {
                overLimitApproverName: getDisplayName(overLimitForwardsTo),
                approverName: getDisplayName(loopApproverEmail),
            });
        }
        return undefined;
    };
    const overLimitApproverErrorText = getOverLimitApproverErrorText();

    const summaryText =
        hasApprovers && hasAmount && hasOverLimitApprover
            ? translate('workflowsApprovalLimitPage.summary', {
                  approverNames: approvers.map((email) => getApprovalLimitShortName(email, personalDetailsByEmail ?? {}, formatPhoneNumber)).join(` ${translate('common.or')} `),
                  approvalLimit: convertToDisplayString(limitInCents, currency),
                  overLimitApproverName: getApprovalLimitShortName(overLimitForwardsTo, personalDetailsByEmail ?? {}, formatPhoneNumber),
              })
            : undefined;

    const saveApprovalLimit = () => {
        if (!hasApprovers || !hasAmount || !hasOverLimitApprover || loopApproverEmail) {
            setHasSubmitted(true);
            return;
        }

        Navigation.goBack(undefined, {
            afterTransition: () => {
                updateApprovalLimit({policy, approvers, originalApprovers, approvalLimit: limitInCents, overLimitForwardsTo});
            },
        });
    };

    const deleteApprovalLimit = () => {
        showConfirmModal({
            title: translate('workflowsApprovalLimitPage.deleteTitle'),
            prompt: translate('workflowsApprovalLimitPage.deletePrompt'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            Navigation.goBack(undefined, {
                afterTransition: () => {
                    updateApprovalLimit({policy, approvers: [], originalApprovers, approvalLimit: null, overLimitForwardsTo: ''});
                },
            });
        });
    };

    const renderUserPill = (email: string) => (
        <View style={styles.pr3}>
            <UserPill
                avatar={personalDetailsByEmail?.[email]?.avatar}
                displayName={personalDetailsByEmail?.[email]?.displayName ?? email}
                email={email}
                style={styles.userPillStandalone}
            />
        </View>
    );

    // An empty "Additional approver" row follows the picked approvers, so another approver can share the limit.
    const approverRows = hasApprovers ? [...approvers, undefined] : [undefined];

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
                    <HeaderWithBackButtonAndTitle title={translate('workflowsApprovalLimitPage.title')}>
                        {isEditFlow && (
                            <Header.IconButton
                                tooltipText={translate('common.delete')}
                                onPress={deleteApprovalLimit}
                                iconSrc={icons.Trashcan}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_LIMIT_DELETE}
                            />
                        )}
                    </HeaderWithBackButtonAndTitle>
                    <ScrollView
                        style={styles.flex1}
                        contentContainerStyle={styles.flexGrow1}
                    >
                        <View style={[styles.mh5, styles.flex1]}>
                            <Text style={[styles.textSupporting, styles.mb5]}>{translate('workflowsApprovalLimitPage.description')}</Text>

                            <Text style={[styles.textStrong, styles.mb3]}>{translate('workflowsApprovalLimitPage.approversWithLimits')}</Text>
                            {approverRows.map((email, approverIndex) => {
                                const description = approverIndex === 0 ? translate('workflowsPage.approver') : translate('workflowsApprovalLimitPage.additionalApproverLabel');
                                const isLastRow = approverIndex === approverRows.length - 1;

                                return (
                                    <MenuItemWithTopDescription
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={`approver-${email}-${approverIndex}`}
                                        accessibilityLabel={email ? getDisplayName(email) : description}
                                        titleStyle={styles.textNormalThemeText}
                                        description={description}
                                        descriptionTextStyle={email ? styles.textLabelSupportingNormal : undefined}
                                        titleComponent={email ? renderUserPill(email) : undefined}
                                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT_APPROVER.getRoute(policyID, approverIndex))}
                                        shouldShowRightIcon
                                        wrapperStyle={styles.sectionMenuItemTopDescription}
                                        brickRoadIndicator={isLastRow && approverErrorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                        errorText={isLastRow ? approverErrorText : undefined}
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_LIMIT_APPROVER}
                                    />
                                );
                            })}

                            <Text style={[styles.textStrong, styles.mt5, styles.mb3]}>{translate('workflowsApprovalLimitPage.limit')}</Text>
                            <View style={styles.mb4}>
                                <AmountForm
                                    label={translate('workflowsApprovalLimitPage.reportAmountLabel')}
                                    currency={currency}
                                    value={approvalLimit}
                                    onInputChange={(value: string) => {
                                        setEditedApprovalLimit(value);
                                        setHasSubmitted(false);
                                    }}
                                    isCurrencyPressable={false}
                                    displayAsTextInput
                                    errorText={amountErrorText}
                                    onSubmitEditing={saveApprovalLimit}
                                />
                            </View>

                            <Text style={[styles.textStrong, styles.mt1, styles.mb3]}>{translate('workflowsApprovalLimitPage.forwardTo')}</Text>
                            <MenuItemWithTopDescription
                                accessibilityLabel={hasOverLimitApprover ? getDisplayName(overLimitForwardsTo) : translate('workflowsApprovalLimitPage.newApprover')}
                                titleStyle={styles.textNormalThemeText}
                                description={translate('workflowsApprovalLimitPage.newApprover')}
                                descriptionTextStyle={hasOverLimitApprover ? styles.textLabelSupportingNormal : undefined}
                                titleComponent={hasOverLimitApprover ? renderUserPill(overLimitForwardsTo) : undefined}
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER.getRoute(policyID))}
                                shouldShowRightIcon
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                brickRoadIndicator={overLimitApproverErrorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                errorText={overLimitApproverErrorText}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_LIMIT_NEW_APPROVER}
                            />
                        </View>
                    </ScrollView>

                    <FixedFooter addBottomSafeAreaPadding>
                        {!!summaryText && <Text style={[styles.textLabelSupporting, styles.textAlignCenter, styles.mb3]}>{summaryText}</Text>}
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            onPress={saveApprovalLimit}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_LIMIT_SAVE}
                        >
                            <Button.Text>{translate('common.save')}</Button.Text>
                        </Button>
                    </FixedFooter>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsApprovalLimitPage.displayName = 'WorkspaceWorkflowsApprovalsApprovalLimitPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsApprovalLimitPage);
