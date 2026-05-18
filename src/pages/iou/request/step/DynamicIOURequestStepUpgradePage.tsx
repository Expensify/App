import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import useActivePolicy from '@hooks/useActivePolicy';
import useCreateNewReport from '@hooks/useCreateNewReport';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {createNewReport} from '@libs/actions/Report';
import {changeTransactionsReport, setTransactionReport} from '@libs/actions/Transaction';
import type CreateWorkspaceParams from '@libs/API/parameters/CreateWorkspaceParams';
import getPlatform from '@libs/getPlatform';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import {getPersonalDetailsForAccountID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';
import UpgradeIntro from '@pages/workspace/upgrade/UpgradeIntro';
import {setCustomUnitRateID, setMoneyRequestParticipants} from '@userActions/IOU/MoneyRequest';
import CONST from '@src/CONST';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, Transaction} from '@src/types/onyx';

type DynamicIOURequestStepUpgradeProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_UPGRADE>;

function DynamicIOURequestStepUpgradePage({
    route: {
        params: {transactionID, action, reportID, shouldSubmitExpense, upgradePath, iouType},
    },
}: DynamicIOURequestStepUpgradeProps) {
    const styles = useThemeStyles();

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const activePolicy = useActivePolicy();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_UPGRADE.path);

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);

    const isTrack = iouType === CONST.IOU.TYPE.TRACK;
    const [isUpgraded, setIsUpgraded] = useState(false);
    const [showConfirmationForm, setShowConfirmationForm] = useState(false);
    const [createdPolicyName, setCreatedPolicyName] = useState('');
    const [isUpgradeWarningModalOpen, setIsUpgradeWarningModalOpen] = useState(false);
    const policyDataRef = useRef<CreateWorkspaceParams | null>(null);
    const isDistanceRateUpgrade = upgradePath === CONST.UPGRADE_PATHS.DISTANCE_RATES;
    const isCategorizing = upgradePath === CONST.UPGRADE_PATHS.CATEGORIES;
    const isReporting = upgradePath === CONST.UPGRADE_PATHS.REPORTS;
    const platform = getPlatform();
    const isWeb = platform === CONST.PLATFORM.WEB;
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const createReportForCurrentUser = useCreateNewReport();

    // Hooks for bulk move functionality
    const {selectedTransactions} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);

    // Build transactions map from selectedTransactions (search results) instead of Onyx TRANSACTION collection
    // This ensures that transactions selected from search are properly included in the map passed to changeTransactionsReport
    const allTransactions = useMemo(
        () =>
            Object.values(selectedTransactions).reduce(
                (transactionsCollection, transactionItem) => {
                    if (transactionItem.transaction) {
                        // eslint-disable-next-line no-param-reassign
                        transactionsCollection[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transaction.transactionID}`] = transactionItem.transaction;
                    }
                    return transactionsCollection;
                },
                {} as NonNullable<OnyxCollection<Transaction>>,
            ),
        [selectedTransactions],
    );

    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const ownerAccountID = selectedReport?.ownerAccountID ?? currentUserPersonalDetails.accountID;

    const ownerPersonalDetails = useMemo(() => getPersonalDetailsForAccountID(ownerAccountID, personalDetails) as PersonalDetails, [personalDetails, ownerAccountID]);

    const feature = Object.values(CONST.UPGRADE_FEATURE_INTRO_MAPPING)
        .filter((value) => value.id !== CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.id)
        .find((f) => f.alias === upgradePath);

    const navigateWithMicrotask = (route: Route) => {
        if (isWeb) {
            Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(route));
        } else {
            Navigation.navigate(route);
        }
    };

    const afterUpgradeAcknowledged = useCallback(() => {
        const expenseReportID = policyDataRef.current?.expenseChatReportID ?? reportID;
        const policyID = policyDataRef.current?.policyID;

        // Bulk move expenses
        if (upgradePath === CONST.UPGRADE_PATHS.REPORTS && policyID && selectedTransactionsKeys.includes(transactionID)) {
            const newPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

            const optimisticReport = createNewReport(ownerPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, newPolicy, betas);

            const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${optimisticReport.reportID}`];
            const policyTagList = policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] : {};

            // Move ALL selected transactions to the new report
            changeTransactionsReport({
                transactionIDs: selectedTransactionsKeys,
                isASAPSubmitBetaEnabled,
                accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                email: session?.email ?? '',
                newReport: optimisticReport,
                policy: newPolicy,
                reportNextStep,
                policyCategories: allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`],
                allTransactions,
                policyTagList,
            });

            clearSelectedTransactions();

            Navigation.dismissModal();
            return;
        }

        if (shouldSubmitExpense) {
            setMoneyRequestParticipants(transactionID, [
                {
                    selected: true,
                    accountID: 0,
                    isPolicyExpenseChat: true,
                    reportID: expenseReportID,
                    policyID: policyDataRef.current?.policyID,
                    searchText: policyDataRef.current?.policyName,
                },
            ]);
        }

        switch (upgradePath) {
            case CONST.UPGRADE_PATHS.DISTANCE_RATES: {
                if (!policyID || !reportID) {
                    Navigation.goBack();
                    return;
                }

                // In case we get here from /:action/track/... route we need to navigate to
                // /:action/submit/... when shouldSubmitExpense === true as transaction is not selfDM anymore
                const backToRoute = shouldSubmitExpense ? ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, reportID) : undefined;

                Navigation.goBack(backToRoute, {compareParams: false});

                // For track expense, we want to create the expense inside self dm (which is not expenseReportID).
                if (!isTrack) {
                    setTransactionReport(transactionID, {reportID: expenseReportID}, true);
                    // Let the confirmation step decide the distance rate because policy data is not fully available at this step
                    setCustomUnitRateID(transactionID, '-1', undefined, undefined);
                    Navigation.setParams({reportID: expenseReportID});
                }

                navigateWithMicrotask(ROUTES.WORKSPACE_CREATE_DISTANCE_RATE_UPGRADE.getRoute(policyID, transactionID, isTrack ? reportID : expenseReportID, iouType, action));
                break;
            }
            case CONST.UPGRADE_PATHS.REPORTS:
                if (action === CONST.IOU.ACTION.CREATE && policyID) {
                    // Coming from "Create report" (no workspace) — create directly with the just-created
                    // workspace. forceReplace removes the upgrade screen from history so back returns to
                    // the originating screen, not the upgrade step.
                    const {reportID: newReportID} = createReportForCurrentUser(policyID);
                    Navigation.setNavigationActionToMicrotaskQueue(() => {
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(newReportID), {forceReplace: true});
                    });
                } else {
                    Navigation.goBack();
                    navigateWithMicrotask(ROUTES.MONEY_REQUEST_STEP_REPORT.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                }

                break;
            case CONST.UPGRADE_PATHS.CATEGORIES:
                Navigation.goBack();
                navigateWithMicrotask(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, reportID), backPath));

                break;
            default:
                Navigation.goBack();
        }
    }, [
        action,
        backPath,
        navigateWithMicrotask,
        reportID,
        shouldSubmitExpense,
        transactionID,
        upgradePath,
        selectedTransactionsKeys,
        clearSelectedTransactions,
        hasViolations,
        isASAPSubmitBetaEnabled,
        allPolicies,
        allReportNextSteps,
        allPolicyCategories,
        session?.accountID,
        session?.email,
        ownerPersonalDetails,
        allTransactions,
        betas,
        iouType,
        isTrack,
        allPolicyTags,
        createReportForCurrentUser,
    ]);

    const participant = transaction?.participants?.[0];

    const [selectedParticipants, setSelectedParticipants] = useState(() => {
        if (!participant) {
            return [];
        }
        const options = [getParticipantsOption(participant.accountID, personalDetails, true, true)];
        return options.length ? [options[0]] : [];
    });

    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        const {policyID} = params;

        setIsUpgraded(true);
        setCreatedPolicyName(params.policyName ?? '');
        setShowConfirmationForm(false);

        policyDataRef.current = params;

        if (upgradePath === CONST.UPGRADE_PATHS.DISTANCE_RATES && policyID && reportID) {
            Policy.openPolicyWorkflowsPage(policyID);
        }
    };

    const showConfirmModal = useCallback(() => {
        if (isRestrictedPolicyCreation) {
            setIsUpgradeWarningModalOpen(true);
        } else {
            setShowConfirmationForm(true);
        }
    }, [isRestrictedPolicyCreation]);

    const onConfirmRestrictedPolicy = useCallback(() => {
        setIsUpgradeWarningModalOpen(false);
        setShowConfirmationForm(true);
    }, []);

    const onCancelRestrictedPolicy = useCallback(() => {
        setIsUpgradeWarningModalOpen(false);
    }, []);

    const onBackButtonPress = useCallback(() => {
        if (showConfirmationForm) {
            setShowConfirmationForm(false);
            return;
        }
        Navigation.goBack();
    }, [showConfirmationForm]);

    return (
        <ScreenWrapper testID="DynamicIOURequestStepUpgradePage">
            <HeaderWithBackButton
                title={translate('workspace.common.upgrade')}
                onBackButtonPress={onBackButtonPress}
                shouldShowBackButton
            />
            <ScrollView style={styles.w100}>
                {isUpgraded ? (
                    <UpgradeConfirmation
                        isDistanceRateUpgrade={isDistanceRateUpgrade}
                        isCategorizing={isCategorizing}
                        isReporting={isReporting}
                        createdPolicyName={createdPolicyName}
                        onDone={afterUpgradeAcknowledged}
                    />
                ) : (
                    <UpgradeIntro
                        isDistanceRateUpgrade={isDistanceRateUpgrade}
                        isCategorizing={isCategorizing}
                        isReporting={isReporting}
                        feature={feature}
                        shouldShowConfirmationForm={showConfirmationForm}
                        shouldShowWorkspaceSelector
                        showConfirmModal={showConfirmModal}
                        showConfirmationForm={showConfirmationForm}
                        setShowConfirmationForm={setShowConfirmationForm}
                        onSubmit={onSubmit}
                        isOffline={isOffline}
                        transaction={transaction}
                        selectedParticipants={selectedParticipants}
                        setSelectedParticipants={setSelectedParticipants}
                        introSelected={introSelected}
                        onboardingPurposeSelected={onboardingPurposeSelected}
                        hasActiveAdminPolicies={hasActiveAdminPolicies}
                        lastWorkspaceNumber={lastWorkspaceNumber}
                        isSelfTourViewed={isSelfTourViewed}
                        activePolicy={activePolicy}
                    />
                )}
            </ScrollView>
            {!!showConfirmationForm && (
                <WorkspaceConfirmationForm
                    isVisible
                    onSubmit={onSubmit}
                    onClose={onBackButtonPress}
                    shouldShowOnlyPlanTypes
                    shouldShowEmployeeSelector={false}
                    shouldShowWorkspaceSelector
                    shouldShowTaxDescription
                    shouldShowMccCode
                    shouldShowLimitedSelectWorkflows
                />
            )}
            {!!isUpgradeWarningModalOpen && (
                <ConfirmModal
                    isVisible
                    title={translate('workspace.upgradeTitle')}
                    prompt={translate('workspace.upgradeWarning')}
                    confirmText={translate('common.continue')}
                    cancelText={translate('common.cancel')}
                    onConfirm={onConfirmRestrictedPolicy}
                    onCancel={onCancelRestrictedPolicy}
                />
            )}
        </ScreenWrapper>
    );
}

export default DynamicIOURequestStepUpgradePage;
