import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
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
    const policyFromHook = usePolicy(route.params.policyID);
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW, {canBeMissing: true});
    const [personalDetailsByEmail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: personalDetailsByEmailSelector,
    });

    const approverIndex = Number(route.params.approverIndex) ?? 0;
    const currentApprover = approvalWorkflow?.approvers?.[approverIndex];
    const currency = policyFromHook?.outputCurrency ?? CONST.CURRENCY.USD;

    const [approvalLimit, setApprovalLimit] = useState<string>(() => {
        if (currentApprover?.approvalLimit) {
            return convertToFrontendAmountAsString(currentApprover.approvalLimit, currency);
        }
        return '';
    });

    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Read the overLimitForwardsTo directly from the current approver in the workflow
    // This ensures we get the updated value after returning from the approver selector
    const selectedApproverEmail = currentApprover?.overLimitForwardsTo ?? '';

    const selectedApproverDisplayName = useMemo(() => {
        if (!selectedApproverEmail) {
            return '';
        }
        const personalDetails = personalDetailsByEmail?.[selectedApproverEmail];
        return Str.removeSMSDomain(personalDetails?.displayName ?? selectedApproverEmail);
    }, [selectedApproverEmail, personalDetailsByEmail]);

    // Check if selected approver already exists in the workflow (circular reference)
    const isCircularReference = useMemo(() => {
        if (!selectedApproverEmail || !approvalWorkflow?.approvers) {
            return false;
        }
        return approvalWorkflow.approvers.some((approver) => approver?.email === selectedApproverEmail);
    }, [selectedApproverEmail, approvalWorkflow?.approvers]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);

    const hasAmount = approvalLimit.length > 0 && Number(approvalLimit) > 0;
    const hasApprover = selectedApproverEmail.length > 0;

    // Determine which error type to show based on the state
    // When both are empty: show only the combined error at bottom
    // When only one is empty: show error on that specific field
    const bothEmpty = !hasAmount && !hasApprover;
    const onlyAmountEmpty = !hasAmount && hasApprover;
    const onlyApproverEmpty = hasAmount && !hasApprover;

    // Bottom error message - only shown when both fields are empty
    const bottomErrorMessage = hasSubmitted && bothEmpty ? translate('workflowsApprovalLimitPage.enterBothError') : '';

    // Field-level errors - only shown when the OTHER field has a value
    const amountErrorText = hasSubmitted && onlyAmountEmpty ? translate('workflowsApprovalLimitPage.enterAmountError') : undefined;
    const approverErrorText = useMemo(() => {
        if (isCircularReference) {
            return translate('workflowsApprovalLimitPage.circularReferenceError', {approverName: selectedApproverDisplayName});
        }
        if (hasSubmitted && onlyApproverEmpty) {
            return translate('workflowsApprovalLimitPage.enterApproverError');
        }
        return undefined;
    }, [hasSubmitted, onlyApproverEmpty, isCircularReference, selectedApproverDisplayName, translate]);

    const handleSkip = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID));
    }, [route.params.policyID]);

    const handleNext = useCallback(() => {
        setHasSubmitted(true);

        if (!hasAmount || !hasApprover || isCircularReference) {
            return;
        }

        if (!approvalWorkflow || !currentApprover) {
            return;
        }

        const limitInCents = convertToBackendAmount(Number.parseFloat(approvalLimit));

        // Update the approver with the approval limit and overLimitForwardsTo
        setApprovalWorkflowApprover({
            approver: {
                ...currentApprover,
                approvalLimit: limitInCents,
                overLimitForwardsTo: selectedApproverEmail,
            },
            approverIndex,
            currentApprovalWorkflow: approvalWorkflow,
            policy: policyFromHook,
            personalDetailsByEmail,
        });

        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID));
    }, [approvalLimit, selectedApproverEmail, isCircularReference, approvalWorkflow, currentApprover, approverIndex, policyFromHook, personalDetailsByEmail, route.params.policyID]);

    const navigateToApproverSelector = useCallback(() => {
        // Navigate to the over-limit approver selector page
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER.getRoute(route.params.policyID, approverIndex));
    }, [route.params.policyID, approverIndex]);

    const buttonContainerStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, style: [styles.mh5, styles.mb5]});

    const approverDisplayName = currentApprover ? Str.removeSMSDomain(currentApprover.displayName) : '';

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
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
                        title={translate('workflowsApprovalLimitPage.title')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(route.params.policyID, approverIndex))}
                    />
                    <ScrollView
                        style={styles.flex1}
                        contentContainerStyle={styles.flexGrow1}
                    >
                        <View style={[styles.mh5, styles.flex1]}>
                            <Text style={[styles.textHeadlineH1, styles.mv3]}>{translate('workflowsApprovalLimitPage.header')}</Text>
                            <View style={styles.mb5}>
                                <RenderHTML html={translate('workflowsApprovalLimitPage.description', {approverName: approverDisplayName})} />
                            </View>

                            <View style={styles.mb4}>
                                <AmountForm
                                    label={translate('workflowsApprovalLimitPage.reportAmountLabel')}
                                    currency={currency}
                                    value={approvalLimit}
                                    onInputChange={setApprovalLimit}
                                    isCurrencyPressable={false}
                                    displayAsTextInput
                                    errorText={amountErrorText}
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
                            />
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
                        <Button
                            large
                            text={translate('workflowsApprovalLimitPage.skip')}
                            onPress={handleSkip}
                            style={styles.mb3}
                        />
                        <Button
                            large
                            success
                            text={translate('workflowsApprovalLimitPage.next')}
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
