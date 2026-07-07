import {getMoneyRequestPolicyTags} from '@libs/actions/IOU';
import {
    getMoneyRequestParticipantOptions,
    setCustomUnitRateID,
    setMoneyRequestDistance,
    setMoneyRequestMerchant,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestPendingFields,
} from '@libs/actions/IOU/MoneyRequest';
import {createDistanceRequest, resetSplitShares} from '@libs/actions/IOU/Split';
import {trackExpense} from '@libs/actions/IOU/TrackExpense';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {calculateDefaultReimbursable, getExistingTransactionID, navigateToConfirmationPage, navigateToParticipantPage} from '@libs/IOUUtils';
import {toLocaleDigit} from '@libs/LocaleDigitUtils';
import cleanupAfterSkipConfirmSubmit from '@libs/Navigation/helpers/cleanupAfterSkipConfirmSubmit';
import {submitWithDismissFirst} from '@libs/Navigation/helpers/submitWithDismissFirst';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getPolicyExpenseChat, getReportOrDraftReport, isMoneyRequestReport as isMoneyRequestReportReportUtils, isSelfDM} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import {getDefaultTaxCode, getDistanceRequestType, getIsFromGlobalCreate, getValidWaypoints} from '@libs/TransactionUtils';

import {setTransactionReport} from '@userActions/Transaction';

import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {
    Beta,
    BillingGraceEndPeriod,
    IntroSelected,
    LastSelectedDistanceRates,
    OdometerDraft,
    PersonalDetailsList,
    Policy,
    QuickAction,
    RecentWaypoint,
    Report,
    Transaction,
    TransactionViolation,
} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import type {Participant} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

type MoneyRequestStepDistanceNavigationParams = {
    iouType: IOUType;
    policy: OnyxEntry<Policy>;
    report: OnyxEntry<Report>;
    reportID: string;
    transactionID: string;
    policyForMovingExpenses?: OnyxEntry<Policy>;
    transaction?: Transaction;
    reportAttributesDerived?: Record<string, ReportAttributes>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    waypoints?: WaypointCollection;
    manualDistance?: number;
    currentUserLogin?: string;
    currentUserAccountID: number;
    currentUserLocalCurrency: string | undefined;
    backTo?: Route;
    backToReport?: string;
    shouldSkipConfirmation: boolean;
    defaultExpensePolicy?: OnyxEntry<Policy> | null;
    isArchivedExpenseReport: boolean;
    isAutoReporting: boolean;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    lastSelectedDistanceRates?: OnyxEntry<LastSelectedDistanceRates>;
    setDistanceRequestData?: (participants: Participant[]) => void;
    translate: <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>) => string;
    quickAction: OnyxEntry<QuickAction>;
    policyRecentlyUsedCurrencies?: string[];
    introSelected?: IntroSelected;
    draftTransactionIDs: string[] | undefined;
    selfDMReport: OnyxEntry<Report>;
    gpsCoordinates?: string;
    gpsDistance?: number;
    odometerStart?: number;
    odometerEnd?: number;
    odometerDistance?: number;
    previousOdometerDraft?: OnyxEntry<OdometerDraft>;
    betas: OnyxEntry<Beta[]>;
    recentWaypoints: OnyxEntry<RecentWaypoint[]>;
    unit?: Unit;
    personalOutputCurrency?: string;
    isSelfTourViewed: boolean;
    amountOwed: OnyxEntry<number>;
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>;
    ownerBillingGracePeriodEnd?: OnyxEntry<number>;
    conciergeReportID: string | undefined;
    optimisticTransactionID: string;
    optimisticChatReportID: string | undefined;
    reportDraft: OnyxEntry<Report> | undefined;
    action: IOUAction;
};

/** Amount + merchant for a manual-distance submit; pending placeholders otherwise (waypoint/GPS distance is computed server-side). */
function buildDistanceAmountAndMerchant({
    isManualDistance,
    distance,
    unit,
    transaction,
    policy,
    translate,
    personalPolicyOutputCurrency,
}: {
    isManualDistance: boolean;
    distance: number | undefined;
    unit: Unit | undefined;
    transaction: Transaction | undefined;
    policy: OnyxEntry<Policy>;
    translate: <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>) => string;
    personalPolicyOutputCurrency: string | undefined;
}): {amount: number; merchant: string} {
    if (!isManualDistance || distance === undefined || !unit) {
        return {amount: 0, merchant: translate('iou.fieldPending')};
    }
    const distanceInMeters = DistanceRequestUtils.convertToDistanceInMeters(distance, unit);
    const mileageRate = DistanceRequestUtils.getRate({transaction, policy, personalPolicyOutputCurrency});
    const amount = DistanceRequestUtils.getDistanceRequestAmount(distanceInMeters, unit, mileageRate?.rate ?? 0);
    const merchant = DistanceRequestUtils.getDistanceMerchant(
        true,
        distanceInMeters,
        unit,
        mileageRate?.rate ?? 0,
        mileageRate?.currency ?? transaction?.currency ?? CONST.CURRENCY.USD,
        translate,
        (digit) => toLocaleDigit(IntlStore.getCurrentLocale(), digit),
        getCurrencySymbol,
        true,
    );
    return {amount, merchant};
}

/**
 * View-layer orchestrator for the distance step (manual / odometer / GPS):
 * routes to confirmation or composes the write + cleanup inside submitWithDismissFirst.
 */
function handleMoneyRequestStepDistanceNavigation({
    iouType,
    report,
    policy,
    transaction,
    reportID,
    transactionID,
    reportAttributesDerived,
    personalDetails,
    waypoints,
    manualDistance,
    currentUserLogin,
    currentUserAccountID,
    currentUserLocalCurrency,
    backTo,
    backToReport,
    shouldSkipConfirmation,
    defaultExpensePolicy,
    isArchivedExpenseReport,
    isAutoReporting,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    lastSelectedDistanceRates,
    setDistanceRequestData,
    translate,
    quickAction,
    policyRecentlyUsedCurrencies,
    introSelected,
    draftTransactionIDs = [],
    selfDMReport,
    gpsCoordinates,
    gpsDistance,
    policyForMovingExpenses,
    odometerStart,
    odometerEnd,
    odometerDistance,
    previousOdometerDraft,
    betas,
    recentWaypoints,
    unit,
    personalOutputCurrency,
    isSelfTourViewed,
    amountOwed,
    userBillingGracePeriodEnds,
    ownerBillingGracePeriodEnd,
    conciergeReportID,
    optimisticTransactionID,
    optimisticChatReportID,
    reportDraft,
    action,
}: MoneyRequestStepDistanceNavigationParams): void {
    const isManualDistance = manualDistance !== undefined;
    const isOdometerDistance = odometerDistance !== undefined;
    const isGPSDistance = gpsDistance !== undefined && gpsCoordinates !== undefined;
    const distanceRequestType = getDistanceRequestType(transaction);

    if (transaction?.splitShares && !isManualDistance && !isOdometerDistance) {
        resetSplitShares(transaction, undefined, undefined, currentUserAccountID);
    }
    if (backTo) {
        Navigation.goBack(backTo);
        return;
    }

    const distance = manualDistance ?? gpsDistance ?? odometerDistance;
    const transactionIsFromGlobalCreate = getIsFromGlobalCreate(transaction);
    const transactionLinkedTrackedExpenseReportAction = transaction?.linkedTrackedExpenseReportAction;

    // If a reportID exists in the report object, it's because either:
    // - The user started this flow from using the + button in the composer inside a report.
    // - The user started this flow from using the global create menu by selecting the Track expense option.
    // In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
    // to the confirm step.
    // If the user started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
    if (report?.reportID && !isArchivedExpenseReport && iouType !== CONST.IOU.TYPE.CREATE) {
        const participants = getMoneyRequestParticipantOptions(
            currentUserAccountID,
            report,
            policy,
            personalDetails,
            conciergeReportID,
            isArchivedExpenseReport,
            reportAttributesDerived,
            reportDraft,
        );

        setDistanceRequestData?.(participants);
        if (shouldSkipConfirmation) {
            cancelSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
            cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_MOUNT);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
            cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION);
            cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY);
            cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD);
            setMoneyRequestPendingFields(transactionID, {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
            const isCreatingTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
            const participant = participants.at(0);
            const isPolicyExpenseChat = !!participant?.isPolicyExpenseChat;
            const defaultReimbursable = calculateDefaultReimbursable({
                iouType,
                policy,
                policyForMovingExpenses,
                participant,
                transactionReportID: transaction?.reportID,
            });

            const validWaypoints = !isManualDistance && !isOdometerDistance ? getValidWaypoints(waypoints, true, isGPSDistance) : undefined;

            const {amount, merchant} = buildDistanceAmountAndMerchant({
                isManualDistance,
                distance,
                unit,
                transaction,
                policy,
                translate,
                personalPolicyOutputCurrency: personalOutputCurrency,
            });
            setMoneyRequestMerchant(transactionID, merchant, false);
            const distanceDefaultTaxCode = getDefaultTaxCode(policy, transaction);
            const distanceTaxCode = (transaction?.taxCode ? transaction.taxCode : distanceDefaultTaxCode) ?? '';
            const distanceTaxAmount = transaction?.taxAmount ?? 0;
            const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
            const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
            const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
            // Part of the onyx.connect migration, it will be removed in further PRs (https://github.com/Expensify/App/issues/72721).
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const policyTagList = getMoneyRequestPolicyTags({
                moneyRequestReportID,
                parentChatReport: currentChatReport,
                participant: participants.at(0) ?? {},
            });
            if (isCreatingTrackExpense && participant) {
                submitWithDismissFirst({
                    // trackExpense is a void action with no navigation params; submitWithDismissFirst owns dismiss/reveal and cleanup runs after.
                    executeWrite: (overrides) => {
                        trackExpense({
                            report,
                            isDraftPolicy: false,
                            existingTransaction: transaction,
                            participantParams: {
                                payeeEmail: currentUserLogin,
                                payeeAccountID: currentUserAccountID,
                                participant,
                            },
                            policyParams: {
                                policy: policyForMovingExpenses,
                            },
                            transactionParams: {
                                amount,
                                distance,
                                currency: transaction?.currency ?? 'USD',
                                created: transaction?.created ?? '',
                                merchant,
                                receipt: {},
                                billable: false,
                                reimbursable: defaultReimbursable,
                                validWaypoints,
                                customUnitRateID: DistanceRequestUtils.getCustomUnitRateID({
                                    reportID: report.reportID,
                                    isTrackDistanceExpense: true,
                                    policy: policyForMovingExpenses,
                                    isPolicyExpenseChat: false,
                                    expenseDate: transaction?.created,
                                }),
                                attendees: transaction?.comment?.attendees,
                                gpsCoordinates,
                                distanceRequestType,
                                odometerStart,
                                odometerEnd,
                                taxCode: distanceTaxCode,
                                taxAmount: distanceTaxAmount,
                                isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                            },
                            isASAPSubmitBetaEnabled,
                            currentUser: {accountID: currentUserAccountID, email: currentUserLogin ?? ''},
                            introSelected,
                            quickAction,
                            draftTransactionIDs,
                            recentWaypoints,
                            betas,
                            isSelfTourViewed,
                            previousOdometerDraft,
                            optimisticTransactionID,
                            optimisticChatReportID,
                            currentUserLocalCurrency,
                        });
                        cleanupAfterSkipConfirmSubmit(overrides.shouldHandleNavigation, {
                            report,
                            action,
                            draftTransactionIDs,
                            transactionID: getExistingTransactionID(transactionLinkedTrackedExpenseReportAction) ?? optimisticTransactionID,
                            isFromGlobalCreate: transactionIsFromGlobalCreate,
                            backToReport,
                            optimisticChatReportID,
                            linkedTrackedExpenseReportAction: transactionLinkedTrackedExpenseReportAction,
                        });
                    },
                    destinationReportID: report?.reportID ?? selfDMReport?.reportID,
                    telemetryContext: {
                        scenario: CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.TRACK_EXPENSE,
                        iouType,
                        requestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                        isFromGlobalCreate: !report?.reportID,
                        hasReceipt: false,
                    },
                });
                return;
            }

            const distanceDestinationReportID = report?.reportID;

            submitWithDismissFirst({
                executeWrite: (overrides) => {
                    const {transactionID: writtenDistanceTransactionID} = createDistanceRequest({
                        report,
                        participants,
                        currentUserLogin: currentUserLogin ?? '',
                        currentUserAccountID,
                        iouType,
                        existingTransaction: transaction,
                        transactionParams: {
                            amount,
                            distance,
                            comment: '',
                            created: transaction?.created ?? '',
                            currency: transaction?.currency ?? 'USD',
                            merchant,
                            billable: !!policy?.defaultBillable,
                            reimbursable: defaultReimbursable,
                            validWaypoints,
                            customUnitRateID: DistanceRequestUtils.getCustomUnitRateID({
                                reportID: report.reportID,
                                isPolicyExpenseChat,
                                policy,
                                lastSelectedDistanceRates,
                                expenseDate: transaction?.created,
                            }),
                            splitShares: transaction?.splitShares,
                            attendees: transaction?.comment?.attendees,
                            gpsCoordinates,
                            distanceRequestType,
                            odometerStart,
                            odometerEnd,
                            taxCode: distanceTaxCode,
                            taxAmount: distanceTaxAmount,
                        },
                        isASAPSubmitBetaEnabled,
                        transactionViolations,
                        quickAction,
                        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                        personalDetails,
                        recentWaypoints,
                        betas,
                        previousOdometerDraft,
                        policyParams: {
                            policyTagList,
                        },
                    });
                    cleanupAfterSkipConfirmSubmit(overrides.shouldHandleNavigation, {
                        report,
                        action,
                        draftTransactionIDs,
                        transactionID: writtenDistanceTransactionID,
                        isFromGlobalCreate: transactionIsFromGlobalCreate,
                        backToReport,
                        optimisticChatReportID,
                        linkedTrackedExpenseReportAction: transactionLinkedTrackedExpenseReportAction,
                    });
                },
                destinationReportID: distanceDestinationReportID,
                telemetryContext: {
                    scenario: CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.DISTANCE,
                    iouType,
                    requestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                    isFromGlobalCreate: !report?.reportID,
                    hasReceipt: false,
                },
            });
            return;
        }
        setMoneyRequestParticipantsFromReport(transactionID, report, currentUserAccountID).then(() => {
            navigateToConfirmationPage(iouType, transactionID, reportID, backToReport, false, undefined, isManualDistance);
        });
        return;
    }

    // If there was no reportID, then that means the user started this flow from the global menu
    // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
    if (defaultExpensePolicy && shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, currentUserAccountID)) {
        const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || isAutoReporting;
        const targetReport = shouldAutoReport ? getPolicyExpenseChat(currentUserAccountID, defaultExpensePolicy?.id) : selfDMReport;
        const isSelfDMReport = isSelfDM(targetReport);
        const transactionReportID = isSelfDMReport ? CONST.REPORT.UNREPORTED_REPORT_ID : targetReport?.reportID;
        const iouTypeTrackOrSubmit = transactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;

        const rateID = DistanceRequestUtils.getCustomUnitRateID({
            reportID: transactionReportID,
            isPolicyExpenseChat: !isSelfDMReport,
            policy: isSelfDMReport ? policyForMovingExpenses : defaultExpensePolicy,
            lastSelectedDistanceRates,
            isTrackDistanceExpense: isSelfDMReport,
            expenseDate: transaction?.created,
        });

        setTransactionReport(transactionID, {reportID: transactionReportID}, true);
        // Do not pass transaction and policy so it only updates customUnitRateID without changing distance and distance unit
        // as it is set for Manual requests before this function is called and transaction may have
        // obsolete customUnit values. personalPolicyOutputCurrency is intentionally omitted for the same reason:
        // without a transaction, setCustomUnitRateID never resolves a rate, so the currency is never read.
        setCustomUnitRateID(transactionID, rateID, undefined, undefined, false, undefined);

        // Update distance and distance unit in transaction object as it is usually set before this function is called using
        // defaultExpensePolicy data which is not accurate in this case as defaultExpensePolicy has autoReporting set to false
        // and because of this this report is converted to selfDM here
        if (isSelfDMReport && distance !== undefined && unit) {
            const ratePolicyForMovingExpenses = policyForMovingExpenses
                ? DistanceRequestUtils.getRateByCustomUnitRateID({customUnitRateID: rateID, policy: policyForMovingExpenses})
                : undefined;
            const currency = ratePolicyForMovingExpenses?.currency ?? personalOutputCurrency ?? CONST.CURRENCY.USD;
            const distanceUnit = ratePolicyForMovingExpenses?.unit ?? DistanceRequestUtils.getRateForP2P(currency, transaction).unit;
            const distanceInMeters = DistanceRequestUtils.convertToDistanceInMeters(distance, unit);
            const distanceInDistanceUnit = roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(distanceInMeters, distanceUnit));
            setMoneyRequestDistance(transactionID, distanceInDistanceUnit, true, distanceUnit);
        }

        setMoneyRequestParticipantsFromReport(transactionID, targetReport, currentUserAccountID).then(() => {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouTypeTrackOrSubmit, transactionID, targetReport?.reportID));
        });
    } else {
        navigateToParticipantPage(iouType, transactionID, reportID);
    }
}

export default handleMoneyRequestStepDistanceNavigation;
