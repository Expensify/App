import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Trashcan} from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import {setApprovalWorkflowApprover} from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsByEmailSelector} from '@src/selectors/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceWorkflowsApprovalsApprovalLimitPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVAL_LIMIT>;

function WorkspaceWorkflowsApprovalsApprovalLimitPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsApprovalLimitPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const [personalDetailsByEmail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: personalDetailsByEmailSelector,
    });

    const policyID = route.params.policyID;
    const approverIndex = Number(route.params.approverIndex ?? 0);
    const backTo = route.params?.backTo;
    const isEditFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT;
    const currentApprover = approvalWorkflow?.approvers?.[approverIndex];
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const [approvalLimit, setApprovalLimit] = useState<string>(() => {
        if (currentApprover?.approvalLimit) {
            return convertToFrontendAmountAsString(currentApprover.approvalLimit, currency);
        }
        return '';
    });

    const [hasSubmitted, setHasSubmitted] = useState(false);

    const selectedApproverEmail = currentApprover?.overLimitForwardsTo ?? '';

    const selectedApproverDisplayName = useMemo(() => {
        if (!selectedApproverEmail) {
            return '';
        }
        const personalDetails = personalDetailsByEmail?.[selectedApproverEmail];
        return Str.removeSMSDomain(personalDetails?.displayName ?? selectedApproverEmail);
    }, [selectedApproverEmail, personalDetailsByEmail]);

    const isCircularReference = useMemo(() => {
        if (!selectedApproverEmail || !currentApprover?.email) {
            return false;
        }
        return currentApprover.email === selectedApproverEmail;
    }, [selectedApproverEmail, currentApprover?.email]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);

    const hasAmount = approvalLimit.length > 0 && Number(approvalLimit) > 0;
    const hasApprover = selectedApproverEmail.length > 0;

    const bothEmpty = !hasAmount && !hasApprover;
    const onlyAmountEmpty = !hasAmount && hasApprover;
    const onlyApproverEmpty = hasAmount && !hasApprover;

    const approverDisplayName = currentApprover ? Str.removeSMSDomain(currentApprover.displayName) : '';
    const isApproverSelected = isEditFlow ? approverDisplayName.length > 0 : true;
    const areLimitFieldsDisabled = isEditFlow && !isApproverSelected;
    const shouldShowRemoveLimitRow = isEditFlow && (hasAmount || hasApprover);

    // In edit mode, user can save with both empty (removes limit). In create mode, show error on submit.
    const bottomErrorMessage = hasSubmitted && bothEmpty && !isEditFlow ? translate('workflowsApprovalLimitPage.enterBothError') : '';
    const amountErrorText = onlyAmountEmpty ? translate('workflowsApprovalLimitPage.enterAmountError') : undefined;
    const approverErrorText = useMemo(() => {
        if (isCircularReference) {
            return translate('workflowsApprovalLimitPage.circularReferenceError', {approverName: selectedApproverDisplayName});
        }
        if (onlyApproverEmpty) {
            return translate('workflowsApprovalLimitPage.enterApproverError');
        }
        return undefined;
    }, [onlyApproverEmpty, isCircularReference, selectedApproverDisplayName, translate]);

    const handleSkip = useCallback(() => {
        if (approvalWorkflow && currentApprover) {
            setApprovalWorkflowApprover({
                approver: {
                    ...currentApprover,
                    approvalLimit: null,
                    overLimitForwardsTo: '',
                },
                approverIndex,
                currentApprovalWorkflow: approvalWorkflow,
                policy,
                personalDetailsByEmail,
            });
        }

        if (isEditFlow) {
            Navigation.goBack(backTo);
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID));
        }
    }, [approvalWorkflow, currentApprover, approverIndex, policy, personalDetailsByEmail, isEditFlow, backTo, policyID]);

    const handleNext = useCallback(() => {
        setHasSubmitted(true);

        const hasValidationError = isCircularReference || onlyAmountEmpty || onlyApproverEmpty || (!isEditFlow && bothEmpty);
        if (hasValidationError || !approvalWorkflow || !currentApprover) {
            return;
        }

        // In edit mode with both empty, clear the limit (same as Remove limit)
        if (isEditFlow && bothEmpty) {
            setApprovalWorkflowApprover({
                approver: {
                    ...currentApprover,
                    approvalLimit: null,
                    overLimitForwardsTo: '',
                },
                approverIndex,
                currentApprovalWorkflow: approvalWorkflow,
                policy,
                personalDetailsByEmail,
            });
            Navigation.goBack(backTo);
            return;
        }

        const limitInCents = convertToBackendAmount(Number.parseFloat(approvalLimit));

        setApprovalWorkflowApprover({
            approver: {
                ...currentApprover,
                approvalLimit: limitInCents,
                overLimitForwardsTo: selectedApproverEmail,
            },
            approverIndex,
            currentApprovalWorkflow: approvalWorkflow,
            policy,
            personalDetailsByEmail,
        });

        if (isEditFlow) {
            Navigation.goBack(backTo);
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID));
        }
    }, [
        approvalLimit,
        selectedApproverEmail,
        isCircularReference,
        onlyAmountEmpty,
        onlyApproverEmpty,
        bothEmpty,
        isEditFlow,
        approvalWorkflow,
        currentApprover,
        approverIndex,
        policy,
        personalDetailsByEmail,
        backTo,
        policyID,
    ]);

    const navigateToApproverSelector = useCallback(() => {
        if (approvalWorkflow && currentApprover && approvalLimit) {
            const limitInCents = convertToBackendAmount(Number.parseFloat(approvalLimit));
            setApprovalWorkflowApprover({
                approver: {
                    ...currentApprover,
                    approvalLimit: limitInCents,
                },
                approverIndex,
                currentApprovalWorkflow: approvalWorkflow,
                policy,
                personalDetailsByEmail,
            });
        }
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER.getRoute(policyID, approverIndex, backTo));
    }, [policyID, approverIndex, approvalWorkflow, currentApprover, approvalLimit, policy, personalDetailsByEmail, backTo]);

    const navigateToApproverChange = useCallback(() => {
        if (approvalWorkflow && currentApprover) {
            const limitInCents = approvalLimit ? convertToBackendAmount(Number.parseFloat(approvalLimit)) : currentApprover.approvalLimit;
            setApprovalWorkflowApprover({
                approver: {
                    ...currentApprover,
                    approvalLimit: limitInCents,
                    overLimitForwardsTo: selectedApproverEmail || currentApprover.overLimitForwardsTo,
                },
                approverIndex,
                currentApprovalWorkflow: approvalWorkflow,
                policy,
                personalDetailsByEmail,
            });
        }
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverIndex, backTo));
    }, [policyID, approverIndex, backTo, approvalWorkflow, currentApprover, approvalLimit, selectedApproverEmail, policy, personalDetailsByEmail]);

    const buttonContainerStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, style: [styles.mh5, styles.mb5]});

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
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
                        title={isEditFlow ? translate('workflowsPage.approver') : translate('workflowsApprovalLimitPage.title')}
                        onBackButtonPress={() => Navigation.goBack(backTo)}
                    />
                    <ScrollView
                        style={styles.flex1}
                        contentContainerStyle={styles.flexGrow1}
                    >
                        <View style={[styles.mh5, styles.flex1]}>
                            {isEditFlow ? (
                                <>
                                    <MenuItemWithTopDescription
                                        title={approverDisplayName}
                                        titleStyle={styles.textNormalThemeText}
                                        description={translate('workflowsPage.approver')}
                                        descriptionTextStyle={approverDisplayName ? styles.textLabelSupportingNormal : undefined}
                                        onPress={navigateToApproverChange}
                                        shouldShowRightIcon
                                        wrapperStyle={styles.sectionMenuItemTopDescription}
                                    />
                                    <View style={[styles.mt3, styles.mb5]}>
                                        <RenderHTML html={translate('workflowsApprovalLimitPage.description', {approverName: approverDisplayName})} />
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Text style={[styles.textHeadlineH1, styles.mv3]}>{translate('workflowsApprovalLimitPage.header')}</Text>
                                    <View style={styles.mb5}>
                                        <RenderHTML html={translate('workflowsApprovalLimitPage.description', {approverName: approverDisplayName})} />
                                    </View>
                                </>
                            )}

                            <View style={styles.mb4}>
                                <AmountForm
                                    label={translate('workflowsApprovalLimitPage.reportAmountLabel')}
                                    currency={currency}
                                    value={approvalLimit}
                                    onInputChange={setApprovalLimit}
                                    isCurrencyPressable={false}
                                    displayAsTextInput
                                    errorText={amountErrorText}
                                    disabled={areLimitFieldsDisabled}
                                />
                            </View>

                            <MenuItemWithTopDescription
                                title={selectedApproverDisplayName}
                                titleStyle={styles.textNormalThemeText}
                                description={translate('workflowsApprovalLimitPage.additionalApproverLabel')}
                                descriptionTextStyle={selectedApproverDisplayName ? styles.textLabelSupportingNormal : undefined}
                                onPress={navigateToApproverSelector}
                                shouldShowRightIcon
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                brickRoadIndicator={approverErrorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                errorText={approverErrorText}
                                shouldRenderErrorAsHTML
                                disabled={areLimitFieldsDisabled}
                                shouldGreyOutWhenDisabled
                            />

                            {shouldShowRemoveLimitRow && (
                                <MenuItem
                                    title={translate('workflowsApprovalLimitPage.removeLimit')}
                                    icon={Trashcan}
                                    onPress={handleSkip}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                />
                            )}
                        </View>

                        {!!bottomErrorMessage && (
                            <DotIndicatorMessage
                                type="error"
                                messages={{error: bottomErrorMessage}}
                                style={[styles.mh5, styles.mb3]}
                            />
                        )}
                    </ScrollView>

                    <View style={buttonContainerStyle}>
                        {!isEditFlow && (
                            <Button
                                large
                                text={translate('workflowsApprovalLimitPage.skip')}
                                onPress={handleSkip}
                                style={styles.mb3}
                            />
                        )}
                        <Button
                            large
                            success
                            text={isEditFlow ? translate('common.save') : translate('workflowsApprovalLimitPage.next')}
                            onPress={handleNext}
                        />
                    </View>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsApprovalLimitPage.displayName = 'WorkspaceWorkflowsApprovalsApprovalLimitPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsApprovalLimitPage);
