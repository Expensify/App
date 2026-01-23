import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import {navigateToConfirmationPage, navigateToParticipantPage} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getManagerMcTestParticipant, getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {findSelfDMReportID, generateReportID, getPolicyExpenseChat} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {getValidWaypoints} from '@libs/TransactionUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {setTransactionReport} from '@userActions/Transaction';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {IntroSelected, LastSelectedDistanceRates, PersonalDetailsList, Policy, QuickAction, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import type {ReportAttributes, ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';
import type {Participant} from '@src/types/onyx/IOU';
import type {Receipt, WaypointCollection} from '@src/types/onyx/Transaction';
import type {GpsPoint} from './index';
import {
    createDistanceRequest,
    getMoneyRequestParticipantsFromReport,
    requestMoney,
    resetSplitShares,
    setCustomUnitRateID,
    setMoneyRequestMerchant,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestPendingFields,
    setMultipleMoneyRequestParticipantsFromReport,
    trackExpense,
} from './index';
import {startSplitBill} from './Split';

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
};

type InitialTransactionParams = {
    transactionID: string;
    reportID?: string;
    taxCode: string;
    taxAmount: number;
    isFromGlobalCreate?: boolean;
    currency?: string;
    participants?: Participant[];
};

type MoneyRequestStepScanParticipantsFlowParams = {
    iouType: IOUType;
    policy: OnyxEntry<Policy>;
    report: OnyxEntry<Report>;
    reportID: string;
    reportAttributesDerived?: Record<string, ReportAttributes>;
    transactions: Transaction[];
    initialTransaction: InitialTransactionParams;
    personalDetails?: PersonalDetailsList;
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
    quickAction: OnyxEntry<QuickAction>;
    policyRecentlyUsedCurrencies?: string[];
    introSelected?: IntroSelected;
    activePolicyID?: string;
    privateIsArchived?: string;
    files: ReceiptFile[];
    isTestTransaction?: boolean;
    locationPermissionGranted?: boolean;
    shouldGenerateTransactionThreadReport: boolean;
};

type MoneyRequestStepDistanceNavigationParams = {
    iouType: IOUType;
    policy: OnyxEntry<Policy>;
    report: OnyxEntry<Report>;
    reportID: string;
    transactionID: string;
    transaction?: Transaction;
    reportAttributesDerived?: Record<string, ReportAttributes>;
    personalDetails?: PersonalDetailsList;
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
    firstCreatedGpsExpenseDateNewDot?: string;
    gpsCoordinates?: string;
    gpsDistance?: number;
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
}: CreateTransactionParams) {
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
            });
        } else {
            requestMoney({
                report,
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
        return participantAccountID ? getParticipantsOption(participant, personalDetails) : getReportOption(participant, privateIsArchived, policy, reportAttributesDerived);
    });
}

function handleMoneyRequestStepScanParticipants({
    iouType,
    policy,
    report,
    reportID,
    reportAttributesDerived,
    transactions,
    initialTransaction,
    personalDetails,
    currentUserLogin,
    currentUserAccountID,
    backTo,
    backToReport,
    shouldSkipConfirmation,
    defaultExpensePolicy,
    shouldGenerateTransactionThreadReport,
    isArchivedExpenseReport,
    isAutoReporting,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    introSelected,
    activePolicyID,
    privateIsArchived,
    files,
    isTestTransaction = false,
    locationPermissionGranted = false,
}: MoneyRequestStepScanParticipantsFlowParams) {
    if (backTo) {
        Navigation.goBack(backTo);
        return;
    }

    if (isTestTransaction) {
        const managerMcTestParticipant = getManagerMcTestParticipant() ?? {};
        let reportIDParam = managerMcTestParticipant.reportID;
        if (!managerMcTestParticipant.reportID && report?.reportID) {
            reportIDParam = generateReportID();
        }
        setMoneyRequestParticipants(
            initialTransaction.transactionID,
            [
                {
                    ...managerMcTestParticipant,
                    reportID: reportIDParam,
                    selected: true,
                },
            ],
            true,
        ).then(() => {
            navigateToConfirmationPage(iouType, initialTransaction.transactionID, reportID, backToReport, true, reportIDParam);
        });
        return;
    }

    // If the user started this flow from using the + button in the composer inside a report
    // the participants can be automatically assigned from the report and the user can skip the participants step and go straight
    // to the confirmation step.
    // If the user is started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
    if (!initialTransaction?.isFromGlobalCreate && !isArchivedExpenseReport && iouType !== CONST.IOU.TYPE.CREATE) {
        const participants = getMoneyRequestParticipantOptions(currentUserAccountID, report, policy, personalDetails, privateIsArchived, reportAttributesDerived);

        if (shouldSkipConfirmation) {
            const firstReceiptFile = files.at(0);
            if (iouType === CONST.IOU.TYPE.SPLIT && firstReceiptFile) {
                const splitReceipt: Receipt = firstReceiptFile.file ?? {};
                splitReceipt.source = firstReceiptFile.source;
                splitReceipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;
                startSplitBill({
                    participants,
                    currentUserLogin: currentUserLogin ?? '',
                    currentUserAccountID,
                    comment: '',
                    receipt: splitReceipt,
                    existingSplitChatReportID: reportID,
                    billable: false,
                    category: '',
                    tag: '',
                    currency: initialTransaction?.currency ?? 'USD',
                    taxCode: initialTransaction.taxCode,
                    taxAmount: initialTransaction.taxAmount,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    // No need to update recently used tags because no tags are used when the confirmation step is skipped
                    policyRecentlyUsedTags: undefined,
                });
                return;
            }
            const participant = participants.at(0);
            if (!participant) {
                return;
            }
            if (locationPermissionGranted) {
                getCurrentPosition(
                    (successData) => {
                        const policyParams = {policy};
                        const gpsPoint = {
                            lat: successData.coords.latitude,
                            long: successData.coords.longitude,
                        };
                        createTransaction({
                            transactions,
                            iouType,
                            report,
                            currentUserAccountID,
                            currentUserEmail: currentUserLogin,
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
                            billable: false,
                            reimbursable: true,
                        });
                    },
                    (errorData) => {
                        Log.info('[IOURequestStepScan] getCurrentPosition failed', false, errorData);
                        // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                        createTransaction({
                            transactions,
                            iouType,
                            report,
                            currentUserAccountID,
                            currentUserEmail: currentUserLogin,
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
                        });
                    },
                );
                return;
            }
            createTransaction({
                transactions,
                iouType,
                report,
                currentUserAccountID,
                currentUserEmail: currentUserLogin,
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
            });
            return;
        }
        const transactionIDs = files.map((receiptFile) => receiptFile.transactionID);
        setMultipleMoneyRequestParticipantsFromReport(transactionIDs, report, currentUserAccountID).then(() =>
            navigateToConfirmationPage(iouType, initialTransaction.transactionID, reportID, backToReport),
        );
        return;
    }

    // If there was no reportID, then that means the user started this flow from the global + menu
    // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
    if (shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy)) {
        const activePolicyExpenseChat = getPolicyExpenseChat(currentUserAccountID, defaultExpensePolicy?.id);
        const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || isAutoReporting;
        const transactionReportID = shouldAutoReport ? activePolicyExpenseChat?.reportID : CONST.REPORT.UNREPORTED_REPORT_ID;

        // If the initial transaction has different participants selected that means that the user has changed the participant in the confirmation step
        if (initialTransaction?.participants && initialTransaction?.participants?.at(0)?.reportID !== activePolicyExpenseChat?.reportID) {
            const selfDMReportID = findSelfDMReportID();
            const isTrackExpense = initialTransaction?.participants?.at(0)?.reportID === selfDMReportID;

            const setParticipantsPromises = files.map((receiptFile) => setMoneyRequestParticipants(receiptFile.transactionID, initialTransaction?.participants));
            Promise.all(setParticipantsPromises).then(() => {
                if (isTrackExpense) {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, initialTransaction.transactionID, selfDMReportID));
                } else {
                    navigateToConfirmationPage(iouType, initialTransaction.transactionID, reportID, backToReport, iouType === CONST.IOU.TYPE.CREATE, initialTransaction?.reportID);
                }
            });
            return;
        }

        const setParticipantsPromises = files.map((receiptFile) => {
            setTransactionReport(receiptFile.transactionID, {reportID: transactionReportID}, true);
            return setMoneyRequestParticipantsFromReport(receiptFile.transactionID, activePolicyExpenseChat, currentUserAccountID);
        });
        Promise.all(setParticipantsPromises).then(() =>
            Navigation.navigate(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                    CONST.IOU.ACTION.CREATE,
                    iouType === CONST.IOU.TYPE.CREATE ? CONST.IOU.TYPE.SUBMIT : iouType,
                    initialTransaction.transactionID,
                    activePolicyExpenseChat?.reportID,
                ),
            ),
        );
    } else {
        navigateToParticipantPage(iouType, initialTransaction.transactionID, reportID);
    }
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
    firstCreatedGpsExpenseDateNewDot,
    gpsCoordinates,
    gpsDistance,
}: MoneyRequestStepDistanceNavigationParams) {
    const isManualDistance = manualDistance !== undefined;
    const isGPSDistance = gpsDistance !== undefined && gpsCoordinates !== undefined;

    if (transaction?.splitShares && !isManualDistance) {
        resetSplitShares(transaction);
    }
    if (backTo) {
        Navigation.goBack(backTo);
        return;
    }

    // If a reportID exists in the report object, it's because either:
    // - The user started this flow from using the + button in the composer inside a report.
    // - The user started this flow from using the global create menu by selecting the Track expense option.
    // In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
    // to the confirm step.
    // If the user started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
    if (report?.reportID && !isArchivedExpenseReport && iouType !== CONST.IOU.TYPE.CREATE) {
        const participants = getMoneyRequestParticipantOptions(currentUserAccountID, report, policy, personalDetails, privateIsArchived, reportAttributesDerived);

        let validWaypoints: WaypointCollection | undefined;
        if (!isManualDistance) {
            if (isGPSDistance) {
                validWaypoints = waypoints;
            } else {
                validWaypoints = getValidWaypoints(waypoints, true);
            }
        }

        setDistanceRequestData?.(participants);
        if (shouldSkipConfirmation) {
            setMoneyRequestPendingFields(transactionID, {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
            setMoneyRequestMerchant(transactionID, translate('iou.fieldPending'), false);
            const participant = participants.at(0);
            if (iouType === CONST.IOU.TYPE.TRACK && participant) {
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
                        amount: 0,
                        distance: manualDistance ?? gpsDistance,
                        currency: transaction?.currency ?? 'USD',
                        created: transaction?.created ?? '',
                        merchant: translate('iou.fieldPending'),
                        receipt: {},
                        billable: false,
                        reimbursable: isManualDistance ? undefined : true,
                        validWaypoints,
                        customUnitRateID,
                        attendees: transaction?.comment?.attendees,
                        gpsCoordinates,
                    },
                    isASAPSubmitBetaEnabled,
                    currentUserAccountIDParam: currentUserAccountID,
                    currentUserEmailParam: currentUserLogin ?? '',
                    introSelected,
                    activePolicyID,
                    quickAction,
                    firstCreatedGpsExpenseDateNewDot,
                });
                return;
            }
            const isPolicyExpenseChat = !!participant?.isPolicyExpenseChat;

            createDistanceRequest({
                report,
                participants,
                currentUserLogin,
                currentUserAccountID,
                iouType,
                existingTransaction: transaction,
                transactionParams: {
                    amount: 0,
                    distance: manualDistance ?? gpsDistance,
                    comment: '',
                    created: transaction?.created ?? '',
                    currency: transaction?.currency ?? 'USD',
                    merchant: translate('iou.fieldPending'),
                    billable: !!policy?.defaultBillable,
                    reimbursable: isManualDistance ? undefined : !!policy?.defaultReimbursable,
                    validWaypoints,
                    customUnitRateID: DistanceRequestUtils.getCustomUnitRateID({reportID: report.reportID, isPolicyExpenseChat, policy, lastSelectedDistanceRates}),
                    splitShares: transaction?.splitShares,
                    attendees: transaction?.comment?.attendees,
                    gpsCoordinates,
                },
                backToReport,
                isASAPSubmitBetaEnabled,
                transactionViolations,
                quickAction,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                firstCreatedGpsExpenseDateNewDot,
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
    if (defaultExpensePolicy && shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy)) {
        const activePolicyExpenseChat = getPolicyExpenseChat(currentUserAccountID, defaultExpensePolicy?.id);
        const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || isAutoReporting;
        const transactionReportID = shouldAutoReport ? activePolicyExpenseChat?.reportID : CONST.REPORT.UNREPORTED_REPORT_ID;
        const rateID = DistanceRequestUtils.getCustomUnitRateID({
            reportID: transactionReportID,
            isPolicyExpenseChat: true,
            policy: defaultExpensePolicy,
            lastSelectedDistanceRates,
        });
        setTransactionReport(transactionID, {reportID: transactionReportID}, true);
        setCustomUnitRateID(transactionID, rateID);
        setMoneyRequestParticipantsFromReport(transactionID, activePolicyExpenseChat, currentUserAccountID).then(() => {
            Navigation.navigate(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                    CONST.IOU.ACTION.CREATE,
                    iouType === CONST.IOU.TYPE.CREATE ? CONST.IOU.TYPE.SUBMIT : iouType,
                    transactionID,
                    activePolicyExpenseChat?.reportID,
                ),
            );
        });
    } else {
        navigateToParticipantPage(iouType, transactionID, reportID);
    }
}

export {createTransaction, handleMoneyRequestStepScanParticipants, handleMoneyRequestStepDistanceNavigation};
export type {MoneyRequestStepScanParticipantsFlowParams, MoneyRequestStepDistanceNavigationParams};
