import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {calculateDefaultReimbursable, getExistingTransactionID, navigateToConfirmationPage, navigateToParticipantPage} from '@libs/IOUUtils';
import {toLocaleDigit} from '@libs/LocaleDigitUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {getPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import {getValidWaypoints} from '@libs/TransactionUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {setTransactionReport} from '@userActions/Transaction';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Beta, IntroSelected, LastSelectedDistanceRates, PersonalDetailsList, Policy, QuickAction, RecentWaypoint, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import type {ReportAttributes, ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';
import type {Participant} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';
import type {Receipt, WaypointCollection} from '@src/types/onyx/Transaction';
import type {GpsPoint} from './index';
import {
    createDistanceRequest,
    getMoneyRequestParticipantsFromReport,
    requestMoney,
    setCustomUnitRateID,
    setMoneyRequestDistance,
    setMoneyRequestMerchant,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestPendingFields,
    trackExpense,
} from './index';
import {resetSplitShares} from './Split';

type CreateTransactionParams = {
    transactions: Transaction[];
    iouType: string;
    report: OnyxEntry<Report>;
    currentUserAccountID: number;
    currentUserEmail?: string;
    backToReport?: string;
    shouldGenerateTransactionThreadReport: boolean;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    quickAction: OnyxEntry<QuickAction>;
    policyRecentlyUsedCurrencies?: string[];
    introSelected?: IntroSelected;
    activePolicyID?: string;
    files: ReceiptFile[];
    participant: Participant;
    gpsPoint?: GpsPoint;
    policyParams?: {policy: OnyxEntry<Policy>};
    billable?: boolean;
    reimbursable?: boolean;
    allTransactionDrafts: OnyxCollection<Transaction>;
    isSelfTourViewed: boolean;
    betas: OnyxEntry<Beta[]>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    recentWaypoints: OnyxEntry<RecentWaypoint[]>;
};

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
    customUnitRateID: string;
    manualDistance?: number;
    currentUserLogin?: string;
    currentUserAccountID: number;
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
    activePolicyID?: string;
    privateIsArchived?: string;
    draftTransactionIDs: string[] | undefined;
    selfDMReport: OnyxEntry<Report>;
    gpsCoordinates?: string;
    gpsDistance?: number;
    odometerStart?: number;
    odometerEnd?: number;
    odometerDistance?: number;
    betas: OnyxEntry<Beta[]>;
    recentWaypoints: OnyxEntry<RecentWaypoint[]>;
    unit?: Unit;
    personalOutputCurrency?: string;
    isSelfTourViewed: boolean;
    amountOwed: OnyxEntry<number>;
};

function createTransaction({
    transactions,
    iouType,
    report,
    currentUserAccountID,
    currentUserEmail,
    backToReport,
    shouldGenerateTransactionThreadReport,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    introSelected,
    activePolicyID,
    files,
    participant,
    gpsPoint,
    policyParams,
    billable,
    reimbursable = true,
    allTransactionDrafts,
    isSelfTourViewed,
    betas,
    personalDetails,
    recentWaypoints,
}: CreateTransactionParams) {
    const draftTransactionIDs = Object.keys(allTransactionDrafts ?? {});

    for (const [index, receiptFile] of files.entries()) {
        const transaction = transactions.find((item) => item.transactionID === receiptFile.transactionID);
        const receipt: Receipt = receiptFile.file ?? {};
        receipt.source = receiptFile.source;
        receipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;
        if (iouType === CONST.IOU.TYPE.TRACK && report) {
            trackExpense({
                report,
                isDraftPolicy: false,
                participantParams: {
                    payeeEmail: currentUserEmail,
                    payeeAccountID: currentUserAccountID,
                    participant,
                },
                transactionParams: {
                    amount: 0,
                    currency: transaction?.currency ?? 'USD',
                    created: transaction?.created,
                    receipt,
                    billable,
                    reimbursable,
                    gpsPoint,
                },
                ...(policyParams ?? {}),
                shouldHandleNavigation: index === files.length - 1,
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail ?? '',
                introSelected,
                activePolicyID,
                quickAction,
                draftTransactionIDs,
                recentWaypoints,
                betas,
                isSelfTourViewed,
            });
        } else {
            const existingTransactionID = getExistingTransactionID(transaction?.linkedTrackedExpenseReportAction);
            const existingTransactionDraft = existingTransactionID ? allTransactionDrafts?.[existingTransactionID] : undefined;

            requestMoney({
                report,
                betas,
                participantParams: {
                    payeeEmail: currentUserEmail,
                    payeeAccountID: currentUserAccountID,
                    participant,
                },
                ...(policyParams ?? {}),
                gpsPoint,
                transactionParams: {
                    amount: 0,
                    attendees: transaction?.comment?.attendees,
                    currency: transaction?.currency ?? 'USD',
                    created: transaction?.created ?? '',
                    merchant: '',
                    receipt,
                    billable,
                    reimbursable,
                },
                shouldHandleNavigation: index === files.length - 1,
                backToReport,
                shouldGenerateTransactionThreadReport,
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail ?? '',
                transactionViolations,
                quickAction,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                existingTransactionDraft,
                draftTransactionIDs,
                isSelfTourViewed,
                personalDetails,
            });
        }
    }
}

function getMoneyRequestParticipantOptions(
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    privateIsArchived?: string,
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'],
): Array<Participant | OptionData> {
    const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserAccountID);
    return selectedParticipants.map((participant) => {
        const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        return participantAccountID
            ? getParticipantsOption(participant, personalDetails)
            : getReportOption(participant, privateIsArchived, policy, currentUserAccountID, personalDetails, reportAttributesDerived);
    });
}

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
    customUnitRateID,
    manualDistance,
    currentUserLogin,
    currentUserAccountID,
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
    activePolicyID,
    privateIsArchived,
    draftTransactionIDs = [],
    selfDMReport,
    gpsCoordinates,
    gpsDistance,
    policyForMovingExpenses,
    odometerStart,
    odometerEnd,
    odometerDistance,
    betas,
    recentWaypoints,
    unit,
    personalOutputCurrency,
    isSelfTourViewed,
    amountOwed,
}: MoneyRequestStepDistanceNavigationParams) {
    const isManualDistance = manualDistance !== undefined;
    const isOdometerDistance = odometerDistance !== undefined;
    const isGPSDistance = gpsDistance !== undefined && gpsCoordinates !== undefined;

    if (transaction?.splitShares && !isManualDistance && !isOdometerDistance) {
        resetSplitShares(transaction);
    }
    if (backTo) {
        Navigation.goBack(backTo);
        return;
    }

    const distance = manualDistance ?? gpsDistance ?? odometerDistance;

    // If a reportID exists in the report object, it's because either:
    // - The user started this flow from using the + button in the composer inside a report.
    // - The user started this flow from using the global create menu by selecting the Track expense option.
    // In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
    // to the confirm step.
    // If the user started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
    if (report?.reportID && !isArchivedExpenseReport && iouType !== CONST.IOU.TYPE.CREATE) {
        const participants = getMoneyRequestParticipantOptions(currentUserAccountID, report, policy, personalDetails, privateIsArchived, reportAttributesDerived);

        setDistanceRequestData?.(participants);
        if (shouldSkipConfirmation) {
            cancelSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
            cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_MOUNT);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
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

            let amount = 0;
            let merchant = translate('iou.fieldPending');
            if (isManualDistance && distance !== undefined && unit) {
                const distanceInMeters = DistanceRequestUtils.convertToDistanceInMeters(distance, unit);
                const mileageRate = DistanceRequestUtils.getRate({transaction, policy});
                amount = DistanceRequestUtils.getDistanceRequestAmount(distanceInMeters, unit, mileageRate?.rate ?? 0);
                merchant = DistanceRequestUtils.getDistanceMerchant(
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
            }
            setMoneyRequestMerchant(transactionID, merchant, false);
            if (isCreatingTrackExpense && participant) {
                trackExpense({
                    report,
                    isDraftPolicy: false,
                    participantParams: {
                        payeeEmail: currentUserLogin,
                        payeeAccountID: currentUserAccountID,
                        participant,
                    },
                    policyParams: {
                        policy,
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
                        customUnitRateID,
                        attendees: transaction?.comment?.attendees,
                        gpsCoordinates,
                        odometerStart,
                        odometerEnd,
                    },
                    isASAPSubmitBetaEnabled,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserLogin ?? '',
                    introSelected,
                    activePolicyID,
                    quickAction,
                    draftTransactionIDs,
                    recentWaypoints,
                    betas,
                    isSelfTourViewed,
                });
                return;
            }

            createDistanceRequest({
                report,
                participants,
                currentUserLogin,
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
                    customUnitRateID: DistanceRequestUtils.getCustomUnitRateID({reportID: report.reportID, isPolicyExpenseChat, policy, lastSelectedDistanceRates}),
                    splitShares: transaction?.splitShares,
                    attendees: transaction?.comment?.attendees,
                    gpsCoordinates,
                    odometerStart,
                    odometerEnd,
                },
                backToReport,
                isASAPSubmitBetaEnabled,
                transactionViolations,
                quickAction,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                personalDetails,
                recentWaypoints,
                betas,
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
    if (defaultExpensePolicy && shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed)) {
        const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || isAutoReporting;
        const targetReport = shouldAutoReport ? getPolicyExpenseChat(currentUserAccountID, defaultExpensePolicy?.id) : selfDMReport;
        const isSelfDMReport = isSelfDM(targetReport);
        const transactionReportID = isSelfDMReport ? CONST.REPORT.UNREPORTED_REPORT_ID : targetReport?.reportID;
        const iouTypeTrackOrSubmit = transactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;

        const rateID = DistanceRequestUtils.getCustomUnitRateID({
            reportID: transactionReportID,
            isPolicyExpenseChat: true,
            policy: defaultExpensePolicy,
            lastSelectedDistanceRates,
        });
        setTransactionReport(transactionID, {reportID: transactionReportID}, true);
        // Do not pass transaction and policy so it only updates customUnitRateID without changing distance and distance unit
        // as it is set for Manual requests before this function is called and transaction may have
        // obsolete customUnit values
        setCustomUnitRateID(transactionID, rateID, undefined, undefined);

        // Update distance and distance unit in transaction object as it is usually set before this function is called using
        // defaultExpensePolicy data which is not accurate in this case as defaultExpensePolicy has autoReporting set to false
        // and because of this this report is converted to selfDM here
        if (isSelfDMReport && distance !== undefined && unit) {
            const personalCurrency = personalOutputCurrency ?? CONST.CURRENCY.USD;
            const personalDistanceUnit = DistanceRequestUtils.getRateForP2P(personalCurrency, transaction).unit;
            const distanceInMeters = DistanceRequestUtils.convertToDistanceInMeters(distance, unit);
            const distanceUsingPersonalDistanceUnit = roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(distanceInMeters, personalDistanceUnit));
            setMoneyRequestDistance(transactionID, distanceUsingPersonalDistanceUnit, true, personalDistanceUnit);
        }

        setMoneyRequestParticipantsFromReport(transactionID, targetReport, currentUserAccountID).then(() => {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouTypeTrackOrSubmit, transactionID, targetReport?.reportID));
        });
    } else {
        navigateToParticipantPage(iouType, transactionID, reportID);
    }
}

export {createTransaction, handleMoneyRequestStepDistanceNavigation, getMoneyRequestParticipantOptions};
export type {MoneyRequestStepDistanceNavigationParams};
