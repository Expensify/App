import Button from '@components/Button';

import useCreateReport from '@hooks/useCreateReport';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultWorkspaceTravelGuard from '@hooks/useDefaultWorkspaceTravelGuard';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {createNewReport} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import getCreateReportRoute, {getReportsRootRoute, navigateToCreateReportWorkspaceSelection} from '@libs/Navigation/helpers/getCreateReportRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import {hasAcceptedTravelTerms, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {generateReportID} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {primaryLoginSelector} from '@src/selectors/Account';
import {createHasTravelEnabledPolicySelector} from '@src/selectors/Policy';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {emailSelector} from '@selectors/Session';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

function QuickCreationActionsBar() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptPlus', 'DocumentPlus', 'LocationAdd', 'LuggageWithLinesPlus']);

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(activePolicyID)}`);
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: primaryLoginSelector});
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();
    const blockIfDefaultWorkspaceLacksTravel = useDefaultWorkspaceTravelGuard({shouldRequireCompletedSetup: false});
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    // A new report has no expenses yet, so it can't have violations.
    const hasViolations = false;
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const hasTravelEnabledPolicySelector = createHasTravelEnabledPolicySelector(email);
    const [hasTravelEnabledPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasTravelEnabledPolicySelector});

    const shouldShowBookTravel = !!hasTravelEnabledPolicy;

    const isBlockedFromSpotnanaTravel = isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL);
    const primaryContactMethod = primaryLogin ?? session?.email ?? '';
    const isTravelReady =
        !(!!isBlockedFromSpotnanaTravel || !primaryContactMethod || Str.isSMSLogin(primaryContactMethod) || !isPaidGroupPolicy(activePolicy)) &&
        hasAcceptedTravelTerms(activePolicy, travelSettings);

    const handleCreateWorkspaceReport = (policy: OnyxEntry<OnyxTypes.Policy>, shouldDismissEmptyReportsConfirmation?: boolean) => {
        if (!policy?.id) {
            return;
        }

        const {reportID: createdReportID} = createNewReport(
            currentUserPersonalDetails,
            hasViolations,
            isASAPSubmitBetaEnabled,
            policy,
            isTrackIntentUser,
            getCurrencyDecimals,
            rules,
            false,
            shouldDismissEmptyReportsConfirmation,
        );
        // Navigate to the Reports page first so getCreateReportRoute() resolves against
        // the Search/Reports fullscreen context before opening the created report modal.
        Navigation.navigate(getReportsRootRoute());
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.navigate(getCreateReportRoute({reportID: createdReportID}));
        });
    };

    const {createReport, isVisible: isCreateReportReady} = useCreateReport({
        onCreateReport: handleCreateWorkspaceReport,
        onNavigateToWorkspaceSelection: navigateToCreateReportWorkspaceSelection,
        shouldHandleNavigationBack: false,
    });

    const handleExpense = () =>
        interceptAnonymousUser(() => {
            startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs);
        }, session);

    const handleDistance = () =>
        interceptAnonymousUser(() => {
            startDistanceRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs, lastDistanceExpenseType);
        }, session);

    const handleBookTravel = () =>
        interceptAnonymousUser(() => {
            if (blockIfDefaultWorkspaceLacksTravel()) {
                return;
            }

            if (isTravelReady) {
                openTravelDotLink(activePolicy?.id);
                return;
            }
            Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(activePolicy?.id));
        }, session);

    return (
        <View style={[styles.flexRow, styles.gap2, styles.pt1, styles.pb5]}>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={handleExpense}
                style={styles.quickCreationActionsBarButton}
                testID={CONST.TEST_ID.QUICK_CREATION_ACTIONS_BAR.EXPENSE}
                accessibilityLabel={translate('common.expense')}
            >
                <Button.Icon src={icons.ReceiptPlus} />
                <Button.Text style={styles.quickCreationActionsBarButtonText}>{translate('common.expense')}</Button.Text>
            </Button>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={createReport}
                isDisabled={!isCreateReportReady}
                style={styles.quickCreationActionsBarButton}
                testID={CONST.TEST_ID.QUICK_CREATION_ACTIONS_BAR.REPORT}
                accessibilityLabel={translate('common.report')}
            >
                <Button.Icon src={icons.DocumentPlus} />
                <Button.Text style={styles.quickCreationActionsBarButtonText}>{translate('common.report')}</Button.Text>
            </Button>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={handleDistance}
                style={styles.quickCreationActionsBarButton}
                testID={CONST.TEST_ID.QUICK_CREATION_ACTIONS_BAR.DISTANCE}
                accessibilityLabel={translate('common.distance')}
            >
                <Button.Icon src={icons.LocationAdd} />
                <Button.Text style={styles.quickCreationActionsBarButtonText}>{translate('common.distance')}</Button.Text>
            </Button>
            {shouldShowBookTravel && (
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={handleBookTravel}
                    style={styles.quickCreationActionsBarButton}
                    testID={CONST.TEST_ID.QUICK_CREATION_ACTIONS_BAR.BOOK_TRAVEL}
                    accessibilityLabel={translate('workspace.common.travel')}
                >
                    <Button.Icon src={icons.LuggageWithLinesPlus} />
                    <Button.Text style={styles.quickCreationActionsBarButtonText}>{translate('workspace.common.travel')}</Button.Text>
                </Button>
            )}
        </View>
    );
}

export default QuickCreationActionsBar;
