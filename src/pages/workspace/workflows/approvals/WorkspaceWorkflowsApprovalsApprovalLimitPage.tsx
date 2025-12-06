import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {clearApprovalWorkflowApprover, setApprovalWorkflowApprover} from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsByEmailSelector} from '@src/selectors/PersonalDetails';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';
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
    const approverIndex = Number(route.params.approverIndex) || 0;
    const isEditFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT;
    const currentApprover = approvalWorkflow?.approvers?.[approverIndex];
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const selectedApproverEmail = currentApprover?.overLimitForwardsTo ?? '';

    const defaultApprovalLimit = useMemo(() => {
        if (currentApprover?.approvalLimit) {
            return convertToFrontendAmountAsString(currentApprover.approvalLimit, currency);
        }
        return '';
    }, [currentApprover?.approvalLimit, currency]);

    const [approvalLimit, setApprovalLimit] = useState(defaultApprovalLimit);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useEffect(() => {
        if (!selectedApproverEmail) {
            return;
        }
        setHasSubmitted(false);
    }, [selectedApproverEmail]);

    useEffect(() => {
        setApprovalLimit(defaultApprovalLimit);
    }, [defaultApprovalLimit]);

    const selectedApproverDisplayName = useMemo(() => {
        if (!selectedApproverEmail) {
            return '';
        }
        const personalDetails = personalDetailsByEmail?.[selectedApproverEmail];
        return Str.removeSMSDomain(personalDetails?.displayName ?? selectedApproverEmail);
    }, [selectedApproverEmail, personalDetailsByEmail]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy);

    const approverDisplayName = currentApprover ? Str.removeSMSDomain(currentApprover.displayName) : '';
    const isApproverSelected = isEditFlow ? approverDisplayName.length > 0 : true;
    const areLimitFieldsDisabled = isEditFlow && !isApproverSelected;

    const hasAmount = approvalLimit.length > 0 && Number(approvalLimit) > 0;
    const hasApprover = selectedApproverEmail.length > 0;
    const bothEmpty = !hasAmount && !hasApprover;
    const onlyAmountEmpty = !hasAmount && hasApprover;
    const onlyApproverEmpty = hasAmount && !hasApprover;

    const amountError = hasSubmitted && onlyAmountEmpty ? translate('workflowsApprovalLimitPage.enterAmountError') : undefined;
    const approverErrorText = useMemo(() => {
        if (hasSubmitted && onlyApproverEmpty) {
            return translate('workflowsApprovalLimitPage.enterApproverError');
        }
        return undefined;
    }, [hasSubmitted, onlyApproverEmpty, translate]);
    const bottomError = hasSubmitted && bothEmpty && !isEditFlow ? translate('workflowsApprovalLimitPage.enterBothError') : undefined;

    const firstApprover = approvalWorkflow?.approvers?.at(0)?.email ?? '';

    const navigateAfterCompletion = useCallback(() => {
        if (isEditFlow) {
            // In edit mode, always go directly to the Edit page when saving
            Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyID, firstApprover));
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID));
    }, [isEditFlow, policyID, firstApprover]);

    const updateCurrentApprover = useCallback(
        (update: Partial<Approver>) => {
            if (!approvalWorkflow || !currentApprover) {
                return;
            }
            setApprovalWorkflowApprover({
                approver: {
                    ...currentApprover,
                    ...update,
                },
                approverIndex,
                currentApprovalWorkflow: approvalWorkflow,
                policy,
                personalDetailsByEmail,
            });
        },
        [approvalWorkflow, currentApprover, approverIndex, policy, personalDetailsByEmail],
    );

    const resetApprovalLimit = useCallback(() => {
        updateCurrentApprover({
            approvalLimit: null,
            overLimitForwardsTo: '',
        });
    }, [updateCurrentApprover]);

    const handleSkip = useCallback(() => {
        resetApprovalLimit();
        navigateAfterCompletion();
    }, [resetApprovalLimit, navigateAfterCompletion]);

    const handleSubmit = useCallback(() => {
        if (!approvalWorkflow) {
            return;
        }

        if (!currentApprover) {
            clearApprovalWorkflowApprover({approverIndex, currentApprovalWorkflow: approvalWorkflow});
            navigateAfterCompletion();
            return;
        }

        if (isEditFlow && bothEmpty) {
            resetApprovalLimit();
            navigateAfterCompletion();
            return;
        }

        if (bothEmpty || onlyAmountEmpty || onlyApproverEmpty) {
            setHasSubmitted(true);
            return;
        }

        const limitInCents = convertToBackendAmount(Number.parseFloat(approvalLimit));
        updateCurrentApprover({
            approvalLimit: limitInCents,
            overLimitForwardsTo: selectedApproverEmail,
        });
        navigateAfterCompletion();
    }, [
        approvalWorkflow,
        currentApprover,
        isEditFlow,
        approverIndex,
        bothEmpty,
        onlyAmountEmpty,
        onlyApproverEmpty,
        approvalLimit,
        selectedApproverEmail,
        resetApprovalLimit,
        navigateAfterCompletion,
        updateCurrentApprover,
    ]);

    const handleAmountChange = useCallback((value: string) => {
        setApprovalLimit(value);
        setHasSubmitted(false);
    }, []);

    const saveCurrentStateToOnyx = useCallback(() => {
        const limitInCents = approvalLimit ? convertToBackendAmount(Number.parseFloat(approvalLimit)) : null;
        updateCurrentApprover({
            approvalLimit: limitInCents,
            overLimitForwardsTo: selectedApproverEmail,
        });
    }, [approvalLimit, selectedApproverEmail, updateCurrentApprover]);

    const navigateToApproverSelector = useCallback(() => {
        saveCurrentStateToOnyx();
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER.getRoute(policyID, approverIndex));
    }, [saveCurrentStateToOnyx, policyID, approverIndex]);

    const navigateToApproverChange = useCallback(() => {
        saveCurrentStateToOnyx();
        // Use the dedicated route for changing approver - it will go BACK to this page after selection
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER_CHANGE.getRoute(policyID, approverIndex));
    }, [saveCurrentStateToOnyx, policyID, approverIndex]);

    const buttonContainerStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true, style: [styles.mh5, styles.mb5]});

    const shouldShowRemoveLimitRow = isEditFlow && (hasAmount || hasApprover);

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
                        onBackButtonPress={() => Navigation.goBack()}
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
                                    onInputChange={handleAmountChange}
                                    isCurrencyPressable={false}
                                    displayAsTextInput
                                    disabled={areLimitFieldsDisabled}
                                    errorText={amountError}
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
                    </ScrollView>

                    {!!bottomError && (
                        <DotIndicatorMessage
                            type="error"
                            messages={{error: bottomError}}
                            style={[styles.mh5, styles.mb3]}
                        />
                    )}

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
                            onPress={handleSubmit}
                        />
                    </View>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsApprovalLimitPage.displayName = 'WorkspaceWorkflowsApprovalsApprovalLimitPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsApprovalLimitPage);
