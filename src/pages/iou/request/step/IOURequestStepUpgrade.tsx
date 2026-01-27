import React, {useRef, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {setTransactionReport} from '@libs/actions/Transaction';
import type CreateWorkspaceParams from '@libs/API/parameters/CreateWorkspaceParams';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';
import UpgradeIntro from '@pages/workspace/upgrade/UpgradeIntro';
import {setCustomUnitRateID, setMoneyRequestParticipants} from '@userActions/IOU';
import CONST from '@src/CONST';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type IOURequestStepUpgradeProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_UPGRADE>;

function IOURequestStepUpgrade({
    route: {
        params: {transactionID, action, reportID, shouldSubmitExpense, upgradePath, backTo},
    },
}: IOURequestStepUpgradeProps) {
    const styles = useThemeStyles();

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});

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
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});

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

    const afterUpgradeAcknowledged = () => {
        const expenseReportID = policyDataRef.current?.expenseChatReportID ?? reportID;
        const policyID = policyDataRef.current?.policyID;
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
        Navigation.goBack();

        switch (upgradePath) {
            case CONST.UPGRADE_PATHS.DISTANCE_RATES: {
                if (!policyID || !reportID) {
                    return;
                }
                setTransactionReport(transactionID, {reportID: expenseReportID}, true);
                // Let the confirmation step decide the distance rate because policy data is not fully available at this step
                setCustomUnitRateID(transactionID, '-1');
                Navigation.setParams({reportID: expenseReportID});

                navigateWithMicrotask(ROUTES.WORKSPACE_CREATE_DISTANCE_RATE_UPGRADE.getRoute(policyID, transactionID, expenseReportID));
                break;
            }
            case CONST.UPGRADE_PATHS.REPORTS:
                navigateWithMicrotask(ROUTES.MONEY_REQUEST_STEP_REPORT.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));

                break;
            case CONST.UPGRADE_PATHS.CATEGORIES:
                navigateWithMicrotask(backTo ?? ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));

                break;
            default:
        }
    };

    const participant = transaction?.participants?.[0];
    const adminParticipant = isDistanceRateUpgrade && participant?.accountID ? getParticipantsOption(participant, personalDetails) : undefined;

    const onUpgrade = () => {
        if (isRestrictedPolicyCreation) {
            setIsUpgradeWarningModalOpen(true);
            return;
        }

        if (isCategorizing || isReporting) {
            setShowConfirmationForm(true);
            return;
        }

        const policyData = Policy.createWorkspace({
            policyOwnerEmail: undefined,
            policyName: undefined,
            policyID: undefined,
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
            currency: currentUserPersonalDetails?.localCurrencyCode ?? '',
            featuresMap: [
                {
                    id: CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED,
                    enabled: isDistanceRateUpgrade,
                },
            ],
            adminParticipant,
            hasOutstandingChildRequest: false,
            introSelected,
            activePolicyID,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.email ?? '',
            onboardingPurposeSelected,
        });
        setIsUpgraded(true);
        policyDataRef.current = policyData;
    };

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const handleConfirmUpgradeWarning = () => {
        setIsUpgradeWarningModalOpen(false);
    };

    const onWorkspaceConfirmationSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        const policyData = Policy.createWorkspace({
            policyOwnerEmail: undefined,
            makeMeAdmin: false,
            policyName: params.name,
            policyID: params.policyID,
            currency: params.currency,
            file: params.avatarFile as File,
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
            introSelected,
            activePolicyID,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.email ?? '',
            onboardingPurposeSelected,
        });
        policyDataRef.current = policyData;
        setCreatedPolicyName(params.name);
        setShowConfirmationForm(false);
        setIsUpgraded(true);
    };

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID="workspaceUpgradePage"
            offlineIndicatorStyle={styles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen={!isUpgraded && !showConfirmationForm}
        >
            {(!!isUpgraded || !showConfirmationForm) && (
                <HeaderWithBackButton
                    title={translate('common.upgrade')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
            )}
            {!showConfirmationForm && (
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    {!!isUpgraded && (
                        <UpgradeConfirmation
                            afterUpgradeAcknowledged={afterUpgradeAcknowledged}
                            policyName={createdPolicyName}
                            isCategorizing={isCategorizing}
                            isReporting={isReporting}
                            isDistanceRateUpgrade={isDistanceRateUpgrade}
                        />
                    )}
                    {!isUpgraded && (
                        <UpgradeIntro
                            feature={feature}
                            onUpgrade={onUpgrade}
                            buttonDisabled={isOffline}
                            loading={false}
                            isCategorizing={isCategorizing}
                            isReporting={isReporting}
                            isDistanceRateUpgrade={isDistanceRateUpgrade}
                        />
                    )}
                </ScrollView>
            )}
            {!isUpgraded && showConfirmationForm && (
                <WorkspaceConfirmationForm
                    policyOwnerEmail={session?.email ?? ''}
                    onSubmit={onWorkspaceConfirmationSubmit}
                    onBackButtonPress={() => setShowConfirmationForm(false)}
                    addBottomSafeAreaPadding={false}
                />
            )}
            <ConfirmModal
                isVisible={isUpgradeWarningModalOpen}
                shouldShowCancelButton={false}
                onConfirm={handleConfirmUpgradeWarning}
                onCancel={handleConfirmUpgradeWarning}
                title={translate('workspace.upgrade.commonFeatures.upgradeWorkspaceWarning')}
                prompt={translate('workspace.upgrade.commonFeatures.upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt')}
                confirmText={translate('common.buttonConfirm')}
            />
        </ScreenWrapper>
    );
}

export default IOURequestStepUpgrade;
