import {format} from 'date-fns';
import type {NullishDeep, OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import DateUtils from '@libs/DateUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getGPSRoutes, getGPSWaypoints} from '@libs/GPSDraftDetailsUtils';
import {formatCurrentUserToAttendee, getExistingTransactionID} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {getCustomUnitID} from '@libs/PerDiemRequestUtils';
import {getDistanceRateCustomUnit, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {
    getReportOrDraftReport,
    isInvoiceRoom,
    isMoneyRequestReport as isMoneyRequestReportReportUtils,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    isSelfDM,
} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {
    getCategoryTaxDetails,
    getDefaultTaxCode,
    getDistanceInMeters,
    getDistanceRateTaxUpdates,
    getIsFromGlobalCreate,
    isDistanceRequest,
    isExpenseUnreported,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
} from '@libs/TransactionUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {getDefaultP2PMileageRate} from '@userActions/Transaction';
import {getRemoveDraftTransactionsByIDsData, removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';
import type {IOURequestType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {
    Beta,
    GpsDraftDetails,
    IntroSelected,
    LastSelectedDistanceRates,
    PersonalDetailsList,
    Policy,
    QuickAction,
    RecentWaypoint,
    Report,
    Transaction,
    TransactionViolation,
} from '@src/types/onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';
import type {Accountant, Attendee, Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Unit} from '@src/types/onyx/Policy';
import type {Comment, Receipt} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getAllTransactionDrafts, getMoneyRequestPolicyTags} from './index';
import {requestMoney, trackExpense} from './TrackExpense';
import type {GPSPoint as GpsPoint} from './types/TrackExpenseTransactionParams';

type CreateTransactionParams = {
    transactions: Transaction[];
    iouType: string;
    report: OnyxEntry<Report>;
    currentUserAccountID: number;
    currentUserEmail?: string;
    shouldGenerateTransactionThreadReport: boolean;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    quickAction: OnyxEntry<QuickAction>;
    policyRecentlyUsedCurrencies?: string[];
    introSelected?: IntroSelected;
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
    optimisticTransactionIDs: string[];
    optimisticChatReportID: string | undefined;
    currentUserLocalCurrency: string | undefined;
};

function createTransaction({
    transactions,
    iouType,
    report,
    currentUserAccountID,
    currentUserEmail,
    shouldGenerateTransactionThreadReport,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    introSelected,
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
    optimisticTransactionIDs,
    optimisticChatReportID,
    currentUserLocalCurrency,
}: CreateTransactionParams) {
    const draftTransactionIDs = Object.keys(allTransactionDrafts ?? {});
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : undefined;
    const parentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policyTagList = getMoneyRequestPolicyTags({moneyRequestReportID, parentChatReport, participant});

    for (const [index, receiptFile] of files.entries()) {
        const transaction = transactions.find((item) => item.transactionID === receiptFile.transactionID);
        const receipt: Receipt = receiptFile.file ?? {};
        receipt.source = receiptFile.source;
        receipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;
        const policy = policyParams?.policy;
        const defaultTaxCode = getDefaultTaxCode(policy, transaction);
        const taxCode = (transaction?.taxCode ? transaction.taxCode : defaultTaxCode) ?? '';
        const taxAmount = transaction?.taxAmount ?? 0;
        const optimisticTransactionID = optimisticTransactionIDs.at(index);
        if (iouType === CONST.IOU.TYPE.TRACK && report) {
            trackExpense({
                report,
                isDraftPolicy: false,
                existingTransaction: transaction,
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
                    taxCode,
                    taxAmount,
                    isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                },
                ...(policyParams ?? {}),
                draftTransactionIDs,
                isASAPSubmitBetaEnabled,
                currentUser: {accountID: currentUserAccountID, email: currentUserEmail ?? ''},
                introSelected,
                quickAction,
                recentWaypoints,
                betas,
                isSelfTourViewed,
                optimisticChatReportID,
                optimisticTransactionID,
                currentUserLocalCurrency,
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
                policyParams: {...(policyParams ?? {}), policyTagList},
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
                    taxCode,
                    taxAmount,
                    isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                },
                draftTransactionIDs,
                shouldGenerateTransactionThreadReport,
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail ?? '',
                transactionViolations,
                quickAction,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                existingTransactionDraft,
                existingTransaction: transaction,
                isSelfTourViewed,
                personalDetails,
                optimisticChatReportID,
                optimisticTransactionID,
            });
        }
    }
}

function getMoneyRequestParticipantOptions(
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    conciergeReportID: string | undefined,
    privateIsArchived: boolean | undefined,
    reportAttributesDerived: ReportAttributesDerivedValue['reports'] | undefined,
    reportDraft: OnyxEntry<Report> | undefined,
): Array<Participant | OptionData> {
    const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserAccountID);
    return selectedParticipants.map((participant) => {
        const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        return participantAccountID
            ? getParticipantsOption(participant, personalDetails)
            : getReportOption(participant, privateIsArchived, policy, personalDetails, conciergeReportID, reportAttributesDerived, reportDraft);
    });
}

type InitMoneyRequestParams = {
    reportID: string;
    policy?: OnyxEntry<Policy>;
    personalPolicy: Pick<Policy, 'id' | 'type' | 'autoReporting' | 'outputCurrency'> | undefined;
    isFromGlobalCreate?: boolean;
    isFromFloatingActionButton?: boolean;
    currentIouRequestType?: IOURequestType | undefined;
    newIouRequestType: IOURequestType | undefined;
    report: OnyxEntry<Report>;
    parentReport: OnyxEntry<Report>;
    currentDate: string | undefined;
    lastSelectedDistanceRates?: OnyxEntry<LastSelectedDistanceRates>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    isTrackDistanceExpense?: boolean;
    hasOnlyPersonalPolicies: boolean;
    draftTransactionIDs?: string[];
    /** New manual expense flow only: seed the fresh transaction with participants so the embedded confirmation step's
     * auto-assign useEffect short-circuits and doesn't re-fire after a tab-switch cleanup. */
    defaultParticipants?: Participant[];
};

/**
 * Initialize expense info
 * @param reportID to attach the transaction to
 * @param policy
 * @param isFromGlobalCreate
 * @param iouRequestType one of manual/scan/distance
 * @param report the report to attach the transaction to
 * @param parentReport the parent report to attach the transaction to
 */
function initMoneyRequest({
    reportID,
    policy,
    personalPolicy,
    isFromGlobalCreate,
    isTrackDistanceExpense = false,
    isFromFloatingActionButton,
    currentIouRequestType,
    newIouRequestType,
    report,
    parentReport,
    currentDate,
    lastSelectedDistanceRates,
    currentUserPersonalDetails,
    hasOnlyPersonalPolicies,
    draftTransactionIDs,
    defaultParticipants,
}: InitMoneyRequestParams) {
    // Generate a brand new transactionID
    const newTransactionID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const currency = policy?.outputCurrency ?? personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;

    const created = currentDate ?? format(new Date(), 'yyyy-MM-dd');

    // We remove draft transactions created during multi scanning if there are some
    removeDraftTransactionsByIDs(draftTransactionIDs, true);

    // in case we have to re-init money request, but the IOU request type is the same with the old draft transaction,
    // we should keep most of the existing data by using the ONYX MERGE operation
    if (currentIouRequestType === newIouRequestType) {
        // so, we just need to update the reportID, isFromGlobalCreate, created, currency
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransactionID}`, {
            reportID,
            isFromGlobalCreate,
            isFromFloatingActionButton,
            created,
            currency,
            transactionID: newTransactionID,
        });
        return;
    }

    const comment: Comment = {
        attendees: formatCurrentUserToAttendee(currentUserPersonalDetails),
    };
    let requestCategory: string | null = null;

    // Set up initial distance expense state
    if (
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE ||
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MAP ||
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL ||
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER ||
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_GPS
    ) {
        if (!isFromGlobalCreate) {
            const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(report) || isPolicyExpenseChatReportUtil(parentReport);
            const customUnitRateID = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                isTrackDistanceExpense,
                policy,
                lastSelectedDistanceRates,
                expenseDate: created,
            });
            comment.customUnit = {customUnitRateID, name: CONST.CUSTOM_UNITS.NAME_DISTANCE};
        } else if (hasOnlyPersonalPolicies) {
            comment.customUnit = {customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID, name: CONST.CUSTOM_UNITS.NAME_DISTANCE};
        }
        if (comment.customUnit) {
            comment.customUnit.quantity = null;
        }
        if (newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL || newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER) {
            comment.waypoints = undefined;
        } else {
            comment.waypoints = {
                waypoint0: {keyForList: 'start_waypoint'},
                waypoint1: {keyForList: 'stop_waypoint'},
            };
        }
    }

    if (newIouRequestType === CONST.IOU.REQUEST_TYPE.PER_DIEM) {
        comment.customUnit = {
            attributes: {
                dates: {
                    start: DateUtils.getStartOfToday(),
                    end: DateUtils.getStartOfToday(),
                },
            },
        };
        if (!isFromGlobalCreate) {
            const {customUnitID, category} = getCustomUnitID(report, parentReport, policy);
            comment.customUnit = {...comment.customUnit, customUnitID};
            requestCategory = category ?? null;
        }
    }

    const defaultMerchant = newIouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL ? CONST.TRANSACTION.DEFAULT_MERCHANT : CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;

    const newTransaction = {
        amount: 0,
        comment,
        created,
        currency,
        category: requestCategory,
        iouRequestType: newIouRequestType,
        reportID,
        transactionID: newTransactionID,
        isFromGlobalCreate,
        isFromFloatingActionButton,
        merchant: defaultMerchant,
        // Seed participants when provided (new manual flow) so the embedded confirmation's auto-assign useEffect
        // short-circuits and doesn't re-fire on subsequent renders/cleanups.
        ...(defaultParticipants && defaultParticipants.length > 0 ? {participants: defaultParticipants, participantsAutoAssigned: true} : {}),
    };

    // Store the transaction in Onyx and mark it as not saved so it can be cleaned up later
    // Use set() here so that there is no way that data will be leaked between objects when it gets reset
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransactionID}`, newTransaction);
    return newTransaction;
}

function createDraftTransaction(transaction: Transaction) {
    if (!transaction) {
        return;
    }

    const newTransaction = {
        ...transaction,
    };

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, newTransaction);
}

function clearMoneyRequest(transactionID: string, draftTransactionIDs: string[] | undefined, skipConfirmation = false) {
    const onyxData: Record<string, null | boolean> = {
        ...getRemoveDraftTransactionsByIDsData(draftTransactionIDs),
        [`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`]: skipConfirmation,
    };
    Onyx.multiSet(onyxData as Parameters<typeof Onyx.multiSet>[0]);
}

function startMoneyRequest(
    iouType: ValueOf<typeof CONST.IOU.TYPE>,
    reportID: string,
    draftTransactionIDs: string[] | undefined,
    requestType?: IOURequestType,
    skipConfirmation = false,
    backToReport?: string,
    isFromFloatingActionButton?: boolean,
) {
    const sourceRoute = Navigation.getActiveRoute();
    // Only the split flow exposes a Distance tab from here, so prefetch the default P2P mileage rate solely for splits to avoid an unnecessary read on other flows.
    if (iouType === CONST.IOU.TYPE.SPLIT) {
        getDefaultP2PMileageRate();
    }
    startSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE, {
        name: '/money-request-create',
        op: CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: iouType,
            [CONST.TELEMETRY.ATTRIBUTE_IOU_REQUEST_TYPE]: requestType ?? 'unknown',
            [CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: reportID,
            [CONST.TELEMETRY.ATTRIBUTE_ROUTE_FROM]: sourceRoute || 'unknown',
        },
    });
    clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, draftTransactionIDs, skipConfirmation);
    if (isFromFloatingActionButton) {
        Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {isFromFloatingActionButton});
    }
    switch (requestType) {
        case CONST.IOU.REQUEST_TYPE.MANUAL:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST.IOU.REQUEST_TYPE.SCAN:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST.IOU.REQUEST_TYPE.DISTANCE:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST.IOU.REQUEST_TYPE.TIME:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_TIME.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        default:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
    }
}

function startDistanceRequest(
    iouType: ValueOf<typeof CONST.IOU.TYPE>,
    reportID: string,
    draftTransactionIDs: string[] | undefined,
    requestType?: IOURequestType,
    skipConfirmation = false,
    backToReport?: string,
    isFromFloatingActionButton?: boolean,
) {
    getDefaultP2PMileageRate();
    clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, draftTransactionIDs, skipConfirmation);
    if (isFromFloatingActionButton) {
        Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {isFromFloatingActionButton});
    }
    switch (requestType) {
        case CONST.IOU.REQUEST_TYPE.DISTANCE_MAP:
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_MAP.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL:
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST.IOU.REQUEST_TYPE.DISTANCE_GPS:
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        default:
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
    }
}

function setMoneyRequestParticipants(transactionID: string, participants: Participant[] = []) {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        participants,
    });
}

/**
 * Finds the participants for an IOU based on the attached report
 * @param transactionID of the transaction to set the participants of
 * @param report attached to the transaction
 */
function getMoneyRequestParticipantsFromReport(report: OnyxEntry<Report>, currentUserAccountID?: number): Participant[] {
    // If the report is iou or expense report, we should get the chat report to set participant for request money
    const chatReport = isMoneyRequestReportReportUtils(report) ? getReportOrDraftReport(report?.chatReportID) : report;
    const isSelfDMChat = !isEmptyObject(chatReport) && isSelfDM(chatReport);
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(chatReport);
    let participants: Participant[] = [];

    if (isPolicyExpenseChat || isSelfDMChat) {
        participants = [
            {
                accountID: 0,
                reportID: chatReport?.reportID,
                isPolicyExpenseChat,
                selected: true,
                policyID: isPolicyExpenseChat ? chatReport?.policyID : undefined,
                isSelfDM: isSelfDMChat,
            },
        ];
    } else if (isInvoiceRoom(chatReport)) {
        participants = [
            {reportID: chatReport?.reportID, selected: true},
            {
                policyID: chatReport?.policyID,
                isSender: true,
                selected: false,
            },
        ];
    } else {
        const chatReportOtherParticipants = Object.keys(chatReport?.participants ?? {})
            .map(Number)
            .filter((accountID) => accountID !== currentUserAccountID);
        participants = chatReportOtherParticipants.map((accountID) => ({accountID, selected: true}));
    }

    return participants;
}

/**
 * Sets the participants for an IOU based on the attached report
 * @param transactionID of the transaction to set the participants of
 * @param report attached to the transaction
 * @param participantsAutoAssigned whether participants were auto assigned
 */
function setMoneyRequestParticipantsFromReport(transactionID: string, report: OnyxEntry<Report>, currentUserAccountID?: number, participantsAutoAssigned = true) {
    const participants = getMoneyRequestParticipantsFromReport(report, currentUserAccountID);
    return Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        participants,
        participantsAutoAssigned,
    });
}

/** Get report policy id of IOU request */
function getIOURequestPolicyID(transaction: OnyxEntry<Transaction>, report: OnyxEntry<Report>): string | undefined {
    // Workspace sender will exist for invoices
    const workspaceSender = transaction?.participants?.find((participant) => participant.isSender);
    return workspaceSender?.policyID ?? report?.policyID;
}

function updateLastLocationPermissionPrompt() {
    Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, new Date().toISOString());
}

function setMultipleMoneyRequestParticipantsFromReport(transactionIDs: string[], reportValue: OnyxEntry<Report>, currentUserAccountID: number) {
    const participants = getMoneyRequestParticipantsFromReport(reportValue, currentUserAccountID);
    const updatedTransactions: Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${string}`, NullishDeep<Transaction>> = {};
    for (const transactionID of transactionIDs) {
        updatedTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`] = {
            participants,
            participantsAutoAssigned: true,
        };
    }
    return Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, updatedTransactions);
}

function setMoneyRequestTaxRate(transactionID: string, taxCode: string | null, isDraft = true) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {taxCode});
}

function setMoneyRequestTaxValue(transactionID: string, taxValue: string | null, isDraft = true) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {taxValue});
}

function setMoneyRequestTaxAmount(transactionID: string, taxAmount: number | null, isDraft = true) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {taxAmount});
}

type TaxRateValues = {
    taxCode: string | null;
    taxAmount: number | null;
    taxValue: string | null;
};

function setMoneyRequestTaxRateValues(transactionID: string, taxRateValues: TaxRateValues, isDraft = true) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {...taxRateValues});
}

/**
 * Sets the category for a money request transaction draft.
 * @param transactionID - The transaction ID
 * @param category - The category name
 * @param policy - The policy object, or undefined for P2P transactions where tax info should be cleared
 * @param isMovingFromTrackExpense - If the expense is moved from Track Expense
 */
function setMoneyRequestCategory(transactionID: string, category: string, policy: OnyxEntry<Policy>, isMovingFromTrackExpense?: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {category});
    if (isMovingFromTrackExpense) {
        return;
    }
    if (!policy) {
        setMoneyRequestTaxRateValues(transactionID, {taxCode: '', taxAmount: null, taxValue: null});
        return;
    }
    const transaction = getAllTransactionDrafts()[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`];
    const {categoryTaxCode, categoryTaxAmount, categoryTaxValue} = getCategoryTaxDetails(category, transaction, policy);
    if (categoryTaxCode && categoryTaxAmount !== undefined && categoryTaxValue) {
        setMoneyRequestTaxRateValues(transactionID, {taxCode: categoryTaxCode, taxAmount: categoryTaxAmount, taxValue: categoryTaxValue});
    }
}

function setMoneyRequestTimeRate(transactionID: string, rate: number, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {units: {rate}}});
}

function setMoneyRequestTimeCount(transactionID: string, count: number, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {units: {count}}});
}

/**
 * Set custom unit rateID for the transaction draft, also updates quantity and distanceUnit
 * if passed transaction previously had it to make sure that transaction does not have inconsistent
 * states (for example distanceUnit not matching distance unit of the new customUnitRateID)
 */
function setCustomUnitRateID(transactionID: string, customUnitRateID: string | undefined, transaction: OnyxEntry<Transaction>, policy: OnyxEntry<Policy>, rateAutoUpdated = false) {
    const isFakeP2PRate = customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;

    let newDistanceUnit: Unit | undefined;
    let newQuantity: number | undefined;

    if (customUnitRateID && transaction) {
        const distanceRate = isFakeP2PRate
            ? DistanceRequestUtils.getRate({transaction: undefined, policy: undefined, useTransactionDistanceUnit: false, isFakeP2PRate})
            : DistanceRequestUtils.getRateByCustomUnitRateID({policy, customUnitRateID});

        const transactionDistanceUnit = transaction.comment?.customUnit?.distanceUnit;
        const transactionQuantity = transaction.comment?.customUnit?.quantity;

        const shouldUpdateDistanceUnit = !!transactionDistanceUnit && !!distanceRate?.unit;
        const shouldUpdateQuantity = transactionQuantity !== null && transactionQuantity !== undefined;

        if (shouldUpdateDistanceUnit) {
            newDistanceUnit = distanceRate.unit;
        }
        if (shouldUpdateQuantity && !!distanceRate?.unit) {
            const newQuantityInMeters = getDistanceInMeters(transaction, transactionDistanceUnit);

            // getDistanceInMeters returns 0 only if there was not enough input to get the correct
            // distance in meters or if the current transaction distance is 0
            if (newQuantityInMeters !== 0) {
                newQuantity = DistanceRequestUtils.convertDistanceUnit(newQuantityInMeters, distanceRate.unit);
            }
        }
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        comment: {
            customUnit: {
                customUnitRateID,
                ...(!isFakeP2PRate && {defaultP2PRate: null}),
                distanceUnit: newDistanceUnit,
                quantity: newQuantity,
                rateAutoUpdated,
            },
        },
    });
}

function setGPSTransactionDraftData(transactionID: string, gpsDraftDetails: GpsDraftDetails | undefined, distance: number) {
    const waypoints = getGPSWaypoints(gpsDraftDetails);
    const routes = getGPSRoutes(gpsDraftDetails);

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        comment: {
            customUnit: {quantity: distance},
            waypoints,
        },
        routes,
    });
}

/**
 * Revert custom unit of the draft transaction to the original transaction's value
 */
function resetDraftTransactionsCustomUnit(transaction: OnyxEntry<Transaction>) {
    if (!transaction?.transactionID) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`, {
        comment: {
            customUnit: transaction.comment?.customUnit ?? {},
        },
    });
}

/**
 * Set custom unit ID for the transaction draft
 */
function setCustomUnitID(transactionID: string, customUnitID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: {customUnit: {customUnitID}}});
}

function setMoneyRequestDistance(transactionID: string, distanceAsFloat: number, isDraft: boolean, distanceUnit: Unit) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {customUnit: {quantity: distanceAsFloat, distanceUnit}}});
}

/**
 * Remember the most recently selected distance rate for a policy so the rate picker
 * defaults to it on the next distance expense for that workspace.
 */
function setLastSelectedDistanceRate(policy: OnyxEntry<Policy>, customUnitRateID: string) {
    if (!policy) {
        return;
    }
    Onyx.merge(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {[policy.id]: customUnitRateID});
}

/**
 * Set the distance rate of a transaction.
 * Used when creating a new transaction or moving an existing one from Self DM
 */
function setMoneyRequestDistanceRate(currentTransaction: OnyxEntry<Transaction>, customUnitRateID: string, policy: OnyxEntry<Policy>, isDraft: boolean) {
    if (!currentTransaction) {
        Log.warn('setMoneyRequestDistanceRate is called without a valid transaction, skipping setting distance rate.');
        return;
    }
    setLastSelectedDistanceRate(policy, customUnitRateID);

    const newDistanceUnit = getDistanceRateCustomUnit(policy)?.attributes?.unit;
    const transactionID = currentTransaction?.transactionID;
    const transaction = isDraft ? getAllTransactionDrafts()[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`] : currentTransaction;

    let newDistance;
    if (newDistanceUnit && newDistanceUnit !== transaction?.comment?.customUnit?.distanceUnit && !isOdometerDistanceRequestTransactionUtils(transaction)) {
        newDistance = DistanceRequestUtils.convertDistanceUnit(getDistanceInMeters(transaction, transaction?.comment?.customUnit?.distanceUnit), newDistanceUnit);
    }

    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            customUnit: {
                customUnitRateID,
                ...(!!policy && {defaultP2PRate: null}),
                ...(newDistanceUnit && {distanceUnit: newDistanceUnit}),
                ...(newDistance && {quantity: newDistance}),
                rateAutoUpdated: false,
            },
        },
    });
}

function setMoneyRequestReceiptState(transactionID: string, isDraft: boolean, shouldStopSmartscan = false) {
    if (!isDraft || !shouldStopSmartscan) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {receipt: {state: CONST.IOU.RECEIPT_STATE.OPEN}});
}

function setMoneyRequestAmount(transactionID: string, amount: number, currency: string, shouldShowOriginalAmount = false, shouldStopSmartscan = false) {
    // Mark that the user has explicitly set the amount. This is used by the new manual expense flow to distinguish
    // a default amount of 0 (field empty) from a user-entered 0 (valid $0 expense).
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {amount, currency, shouldShowOriginalAmount, isAmountSet: true});
    setMoneyRequestReceiptState(transactionID, true, shouldStopSmartscan);
}

/**
 * Clears the amount field back to an empty/unset state in the new manual expense flow.
 * Called when the user deletes all characters from the amount input so that the field
 * shows as empty and submission is blocked until a value is entered again.
 */
function clearMoneyRequestAmount(transactionID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {amount: 0, isAmountSet: false});
}

function clearMoneyRequestMerchant(transactionID: string, isDraft = true) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {merchant: '', isMerchantSet: false});
}

function setMoneyRequestCreated(transactionID: string, created: string, isDraft: boolean, shouldStopSmartscan = false) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {created});
    setMoneyRequestReceiptState(transactionID, isDraft, shouldStopSmartscan);
}

function setMoneyRequestDateAttribute(transactionID: string, start: string, end: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: {customUnit: {attributes: {dates: {start, end}}}}});
}

function setMoneyRequestCurrency(transactionID: string, currency: string, isEditing = false) {
    const fieldToUpdate = isEditing ? 'modifiedCurrency' : 'currency';
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {[fieldToUpdate]: currency});
}

function setMoneyRequestDescription(transactionID: string, comment: string, isDraft: boolean, shouldStopSmartscan = false) {
    // Trim only when persisting to the real transaction (not a draft) to avoid
    // stripping trailing spaces/newlines while the user is still typing.
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {comment: isDraft ? comment : comment.trim()}});
    setMoneyRequestReceiptState(transactionID, isDraft, shouldStopSmartscan);
}

function setMoneyRequestMerchant(transactionID: string, merchant: string, isDraft: boolean, shouldStopSmartscan = false) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {merchant, isMerchantSet: true});
    setMoneyRequestReceiptState(transactionID, isDraft, shouldStopSmartscan);
}

function setMoneyRequestAttendees(transactionID: string, attendees: Attendee[], isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {attendees}});
}

function setMoneyRequestAccountant(transactionID: string, accountant: Accountant, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {accountant});
}

function setMoneyRequestPendingFields(transactionID: string, pendingFields: Transaction['pendingFields']) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {pendingFields});
}

function setMoneyRequestTag(transactionID: string, tag: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {tag});
}

function setMoneyRequestBillable(transactionID: string, billable: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {billable});
}

function setMoneyRequestReimbursable(transactionID: string, reimbursable: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {reimbursable});
}

function clearMoneyRequestRateAutoUpdated(transactionID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        comment: {
            customUnit: {
                rateAutoUpdated: false,
            },
        },
    });
}

/**
 * Recalculates the distance rate when the expense date changes during expense creation.
 * Sets rateAutoUpdated when the selected rate changes so the confirmation page can show the educational tooltip.
 */
function updateDistanceRateOnExpenseDateChange({
    transactionID,
    transaction,
    newCreated,
    reportID,
    isPolicyExpenseChat,
    isTrackExpense,
    policy,
    policyForTrackExpense,
    lastSelectedDistanceRates,
    isDraft,
}: {
    transactionID: string;
    transaction: OnyxEntry<Transaction>;
    newCreated: string;
    reportID: string;
    isPolicyExpenseChat: boolean;
    isTrackExpense: boolean;
    policy: OnyxEntry<Policy>;
    policyForTrackExpense: OnyxEntry<Policy>;
    lastSelectedDistanceRates: OnyxEntry<LastSelectedDistanceRates>;
    isDraft: boolean;
}) {
    if (!isDistanceRequest(transaction) || !(isPolicyExpenseChat || isTrackExpense)) {
        return;
    }

    const effectivePolicy = isTrackExpense ? policyForTrackExpense : policy;
    const rateID = DistanceRequestUtils.getCustomUnitRateID({
        reportID,
        isPolicyExpenseChat,
        policy: effectivePolicy,
        lastSelectedDistanceRates,
        isTrackDistanceExpense: isTrackExpense,
        expenseDate: newCreated,
    });
    const currentRateID = transaction?.comment?.customUnit?.customUnitRateID;
    const rateChanged = rateID !== currentRateID;
    setCustomUnitRateID(transactionID, rateID, transaction, effectivePolicy, rateChanged);

    if (rateChanged && rateID && isTaxTrackingEnabled(isPolicyExpenseChat || isTrackExpense || isExpenseUnreported(transaction), effectivePolicy, isDistanceRequest(transaction))) {
        const mileageRates = DistanceRequestUtils.getMileageRates(effectivePolicy);
        const distanceUnit = mileageRates[rateID] ? DistanceRequestUtils.getDistanceUnit(transaction, mileageRates[rateID]) : transaction?.comment?.customUnit?.distanceUnit;
        const {taxAmount, taxCode, taxValue} = getDistanceRateTaxUpdates(effectivePolicy, transaction, rateID, distanceUnit);
        setMoneyRequestTaxRate(transactionID, taxCode || null, isDraft);
        setMoneyRequestTaxAmount(transactionID, taxAmount, isDraft);
        setMoneyRequestTaxValue(transactionID, taxValue ?? null, isDraft);
    }
}

function setMoneyRequestReportID(transactionID: string, reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {reportID});
}

export {
    createTransaction,
    getMoneyRequestParticipantOptions,
    initMoneyRequest,
    createDraftTransaction,
    clearMoneyRequest,
    startMoneyRequest,
    startDistanceRequest,
    setMoneyRequestParticipants,
    getMoneyRequestParticipantsFromReport,
    setMoneyRequestParticipantsFromReport,
    getIOURequestPolicyID,
    updateLastLocationPermissionPrompt,
    setMultipleMoneyRequestParticipantsFromReport,
    setMoneyRequestTaxRate,
    setMoneyRequestTaxValue,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRateValues,
    setMoneyRequestCategory,
    setMoneyRequestTimeRate,
    setMoneyRequestTimeCount,
    setCustomUnitRateID,
    updateDistanceRateOnExpenseDateChange,
    clearMoneyRequestRateAutoUpdated,
    setGPSTransactionDraftData,
    resetDraftTransactionsCustomUnit,
    setCustomUnitID,
    setMoneyRequestDistance,
    setMoneyRequestDistanceRate,
    setMoneyRequestAmount,
    clearMoneyRequestAmount,
    clearMoneyRequestMerchant,
    setMoneyRequestCreated,
    setMoneyRequestDateAttribute,
    setMoneyRequestCurrency,
    setMoneyRequestDescription,
    setMoneyRequestMerchant,
    setMoneyRequestAttendees,
    setMoneyRequestAccountant,
    setMoneyRequestPendingFields,
    setMoneyRequestTag,
    setMoneyRequestBillable,
    setMoneyRequestReimbursable,
    setMoneyRequestReportID,
    setLastSelectedDistanceRate,
};
