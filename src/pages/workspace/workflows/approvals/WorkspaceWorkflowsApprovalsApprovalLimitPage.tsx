import {useIsFocused} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import AmountForm from '@components/AmountForm';
import type {NumberWithSymbolFormRef} from '@components/AmountForm';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {clearApprovalWorkflowApprover, setApprovalWorkflowApprover, setApprovalWorkflowIsInitialFlow} from '@userActions/Workflow';
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
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
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

    const defaultApprovalLimit = currentApprover?.approvalLimit ? convertToFrontendAmountAsString(currentApprover.approvalLimit, currency) : '';

    const [editedApprovalLimit, setEditedApprovalLimit] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const amountFormRef = useRef<NumberWithSymbolFormRef>(null);
    const isFocused = useIsFocused();

    const approvalLimit = editedApprovalLimit ?? defaultApprovalLimit;

    // Clear the amount input when the screen is focused and the over-limit approver was unselected
    useEffect(() => {
        if (!isFocused || currentApprover?.approvalLimit != null || editedApprovalLimit !== null) {
            return;
        }
        amountFormRef.current?.updateNumber('');
    }, [isFocused, currentApprover?.approvalLimit, editedApprovalLimit]);

    const selectedApproverPersonalDetails = selectedApproverEmail ? personalDetailsByEmail?.[selectedApproverEmail] : undefined;
    const selectedApproverDisplayName = selectedApproverEmail ? Str.removeSMSDomain(selectedApproverPersonalDetails?.displayName ?? selectedApproverEmail) : '';

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
    const approverErrorText = hasSubmitted && onlyApproverEmpty ? translate('workflowsApprovalLimitPage.enterApproverError') : undefined;

    const firstApprover = approvalWorkflow?.originalApprovers?.at(0)?.email ?? '';

    const navigateAfterCompletion = () => {
        if (isEditFlow) {
            // In edit mode, always go directly to the Edit page when saving
            Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyID, firstApprover));
            return;
        }
        // Mark that we've completed the initial wizard flow before navigating to the summary page
        setApprovalWorkflowIsInitialFlow(false);
        // Use forceReplace to replace the ApprovalLimit page in the navigation stack
        // so that when the user presses back from the Create page, they go to the Approver page
        // (not back to ApprovalLimit, especially when skipping)
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID), {forceReplace: true});
    };

    const updateCurrentApprover = (update: Partial<Approver>) => {
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
    };

    const resetApprovalLimit = () => {
        updateCurrentApprover({
            approvalLimit: null,
            overLimitForwardsTo: '',
        });
    };

    const handleSkip = () => {
        resetApprovalLimit();
        navigateAfterCompletion();
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

        if (bothEmpty) {
            resetApprovalLimit();
            navigateAfterCompletion();
            return;
        }

        if (onlyAmountEmpty || onlyApproverEmpty) {
            setHasSubmitted(true);
            return;
        }

        const limitInCents = convertToBackendAmount(Number.parseFloat(approvalLimit));
        updateCurrentApprover({
            approvalLimit: limitInCents,
            overLimitForwardsTo: selectedApproverEmail,
        });
        navigateAfterCompletion();
    };

    const handleAmountChange = (value: string) => {
        setEditedApprovalLimit(value);
        setHasSubmitted(false);
    };

    const saveCurrentStateToOnyx = () => {
        const limitInCents = approvalLimit ? convertToBackendAmount(Number.parseFloat(approvalLimit)) : null;
        updateCurrentApprover({
            approvalLimit: limitInCents,
            overLimitForwardsTo: selectedApproverEmail,
        });
        setEditedApprovalLimit(null);
        setHasSubmitted(false);
    };

    const navigateToApproverSelector = () => {
        saveCurrentStateToOnyx();
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER.getRoute(policyID, approverIndex));
    };

    const navigateToApproverChange = () => {
        saveCurrentStateToOnyx();
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER_CHANGE.getRoute(policyID, approverIndex));
    };

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
                                    <View style={[styles.mt3, styles.mb5, styles.renderHTML]}>
                                        <RenderHTML html={translate('workflowsApprovalLimitPage.description', {approverName: approverDisplayName})} />
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Text style={[styles.textHeadlineH1, styles.mv3]}>{translate('workflowsApprovalLimitPage.header')}</Text>
                                    <View style={[styles.mb5, styles.renderHTML]}>
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
                                    onSubmitEditing={handleSubmit}
                                    numberFormRef={amountFormRef}
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
                                    icon={icons.Trashcan}
                                    onPress={handleSkip}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                />
                            )}
                        </View>
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
