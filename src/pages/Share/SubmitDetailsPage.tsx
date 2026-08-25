import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LocationPermissionModal from '@components/LocationPermissionModal';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import ScreenWrapper from '@components/ScreenWrapper';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useMoneyRequestPolicyTags from '@hooks/useMoneyRequestPolicyTags';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePreMountDestination from '@hooks/usePreMountDestination';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useThemeStyles from '@hooks/useThemeStyles';

import {
    getIOURequestPolicyID,
    getMoneyRequestParticipantsFromReport,
    initMoneyRequest,
    setMoneyRequestBillable,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestReimbursable,
    updateLastLocationPermissionPrompt,
} from '@libs/actions/IOU/MoneyRequest';
import {setMoneyRequestReceipt} from '@libs/actions/IOU/Receipt';
import {requestMoney, trackExpense} from '@libs/actions/IOU/TrackExpense';
import type {GPSPoint as GpsPoint} from '@libs/actions/IOU/types/TrackExpenseTransactionParams';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getFileName, readFileAsync} from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getExistingTransactionID, isLookingAroundSearchRoutingActive, resolveReportForMoneyRequest} from '@libs/IOUUtils';
import Log from '@libs/Log';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil, isGroupPolicy, resolveCurrentTaxCode} from '@libs/PolicyUtils';
import ReceiptStorage from '@libs/ReceiptStorage';
import {shouldValidateFile} from '@libs/ReceiptUtils';
import {getReportOrDraftReport, isMoneyRequestReport, isSelfDM} from '@libs/ReportUtils';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';
import {logReceiptAdoptFailed, logReceiptCaptured, logReceiptSubmitted, mintAndStampReceiptTraceId} from '@libs/telemetry/ReceiptObservability';
import {cancelTracking} from '@libs/telemetry/submitFollowUpAction';
import {getDefaultTaxCode, getIsFromGlobalCreate, getTaxValue} from '@libs/TransactionUtils';

import DraftWorkspaceOpener from '@pages/iou/request/step/confirmation/DraftWorkspaceOpener';
import getSubmitExpensePreMountDestinationRoute from '@pages/iou/request/step/confirmation/getSubmitExpensePreMountDestinationRoute';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report as ReportType} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';

import type {StackScreenProps} from '@react-navigation/stack';
import type {OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import {showErrorAlert} from './ShareRootPage';
import useShareFileSizeValidation from './useShareFileSizeValidation';

type ShareDetailsPageProps = StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SUBMIT_DETAILS>;

function SubmitDetailsPage({
    route: {
        params: {reportOrAccountID},
    },
}: ShareDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale, formatPhoneNumber} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();
    const [unknownUserDetails] = useOnyx(ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS);
    const [personalDetails] = useOnyx(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`);
    const report: OnyxEntry<ReportType> = useReportOrReportDraft(reportOrAccountID);
    const routeReportID = isMoneyRequestReport(report) ? report?.chatReportID : report?.reportID;
    const draftReportID = unknownUserDetails ? unknownUserDetails.reportID : routeReportID;
    const [reportDraft] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${draftReportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);
    const transactionReport = useReportOrReportDraft(transaction?.reportID);
    const [reportNameValuePair] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(transactionReport?.reportID)}`);
    const iouType = isSelfDM(report) ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;
    // Self-DM's FAKE policyID can't load real policy data — usePolicyForTransaction resolves the active workspace instead.
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: getIOURequestPolicyID(transaction, report),
        action: CONST.IOU.ACTION.CREATE,
        iouType,
        isPerDiemRequest: false,
    });
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const reportAttributesDerived = useReportAttributes();
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const [validFilesToUpload] = useOnyx(ONYXKEYS.VALIDATED_FILE_OBJECT);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policy?.id}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policy?.id}`);

    const [currentAttachment] = useOnyx(ONYXKEYS.SHARE_TEMP_FILE);
    const shouldUsePreValidatedFile = shouldValidateFile(currentAttachment);
    const isLinkedTrackedExpenseReportArchived = useReportIsArchived(transaction?.linkedTrackedExpenseReportID);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const draftTransactionIDs = Object.keys(transactionDrafts ?? {});

    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalPolicy = usePersonalPolicy();
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    // Set when the destination report didn't exist at submit time (e.g. a brand-new recipient) — the expense create
    // writes it optimistically, and we keep the confirm button in its loading state until it lands so dismissing doesn't flash the inbox.
    const [pendingNavigationReportID, setPendingNavigationReportID] = useState<string | undefined>(undefined);
    const [pendingNavigationReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(pendingNavigationReportID)}`);
    const hasStartedPendingNavigation = useRef(false);
    const formHasBeenSubmitted = useRef(false);
    const hasCalledReveal = useRef(false);
    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);

    const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const {isBetaEnabled} = usePermissions();
    const fileUri = shouldUsePreValidatedFile ? (validFilesToUpload?.uri ?? '') : (currentAttachment?.content ?? '');
    const fileName = shouldUsePreValidatedFile ? getFileName(validFilesToUpload?.uri ?? CONST.ATTACHMENT_IMAGE_DEFAULT_NAME) : getFileName(currentAttachment?.content ?? '');
    const fileType = shouldUsePreValidatedFile ? (validFilesToUpload?.type ?? CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG) : (currentAttachment?.mimeType ?? '');
    const [hasOnlyPersonalPolicies = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasOnlyPersonalPoliciesUtil});
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);
    const {isOffline} = useNetwork();
    const isLookingAroundUser = isLookingAroundSearchRoutingActive(introSelected?.choice === CONST.ONBOARDING_CHOICES.LOOKING_AROUND, isOffline);

    const hasEndedOpenSubmitFlowSpan = useRef(false);
    const endOpenSubmitFlowSpan = () => {
        if (hasEndedOpenSubmitFlowSpan.current) {
            return;
        }
        hasEndedOpenSubmitFlowSpan.current = true;
        endSpan(CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW);
    };

    // Cancel the still-open span if the user leaves before the confirm container's onLayout ends it, so an abandoned attempt is not recorded as a never-ending span.
    useEffect(
        () => () => {
            cancelSpan(CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW);
        },
        [],
    );

    useEffect(() => {
        if (!errorTitle || !errorMessage) {
            return;
        }

        showErrorAlert(errorTitle, errorMessage);
    }, [errorTitle, errorMessage]);

    useEffect(() => {
        initMoneyRequest({
            reportID: reportOrAccountID,
            policy,
            personalPolicy,
            currentIouRequestType: transaction?.iouRequestType,
            newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            report,
            parentReport,
            currentDate,
            hasOnlyPersonalPolicies,
            draftTransactionIDs,
        });
        // Populate transaction.participants so IOURequestStepReport can highlight the destination (mirrors other expense flows).
        setMoneyRequestParticipantsFromReport(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, report, currentUserPersonalDetails.accountID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportOrAccountID, policy, personalPolicy, report, parentReport, currentDate, currentUserPersonalDetails.accountID, hasOnlyPersonalPolicies]);

    // Use the branch-aware values computed above: for a share that needs conversion (e.g. HEIC), these resolve to the
    // converted JPEG from VALIDATED_FILE_OBJECT; otherwise they fall back to the raw attachment. Re-deriving from
    // currentAttachment here would discard the converted file (its content/mimeType are always set), uploading raw
    // image/heic which the backend rejects. This mirrors ShareDetailsPage.
    const sharedFileSource = fileUri;
    const sharedFileName = fileName;
    const sharedFileType = fileType;

    // Seed the draft so isScanRequest() returns true (enables compact mode + receipt rendering).
    useEffect(() => {
        if (!sharedFileSource) {
            return;
        }
        setMoneyRequestReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, sharedFileSource, sharedFileName, true, sharedFileType);
    }, [sharedFileSource, sharedFileName, sharedFileType]);

    // Prefer the draft receipt (reflects Replace/Crop) for both display and upload — keeps them in sync.
    const currentReceiptSource = typeof transaction?.receipt?.source === 'string' ? transaction.receipt.source : sharedFileSource;
    // Avoid getFileName(): its decodeURIComponent throws on raw '%' in filenames (e.g., "Receipt 100%.jpg").
    const currentReceiptName = (transaction?.receipt?.filename?.split('/').pop() ?? '') || sharedFileName;
    const currentReceiptType = transaction?.receipt?.type ?? sharedFileType;

    // Validate the same source that performUpload reads — so Replace/Crop to an oversized file is still caught before submit.
    useShareFileSizeValidation(currentReceiptSource, setErrorTitle, setErrorMessage, !errorTitle);

    const selectedParticipants = unknownUserDetails ? [unknownUserDetails] : getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID);
    const participants = selectedParticipants.map((participant) => {
        const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`];
        return participant?.accountID
            ? getParticipantsOption(participant, personalDetails, translate)
            : getReportOption(participant, privateIsArchived, policy, personalDetails, conciergeReportID, reportAttributesDerived, reportDraft, currentUserPersonalDetails.accountID, {
                  translate,
                  dateFnsLocale,
              });
    });

    const isPolicyExpenseChat = participants?.some((participant) => participant.isPolicyExpenseChat);
    const policyExpenseChatPolicyID = participants?.find((participant) => participant.isPolicyExpenseChat)?.policyID;
    const senderPolicyID = participants?.find((participant) => !!participant && 'isSender' in participant && participant.isSender)?.policyID;
    const isCreatingTrackExpense = iouType === CONST.IOU.TYPE.TRACK;

    const defaultBillable = !!policy?.defaultBillable;
    useEffect(() => {
        setMoneyRequestBillable(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, defaultBillable);
    }, [defaultBillable]);

    useEffect(() => {
        const defaultReimbursable = (isPolicyExpenseChat && isGroupPolicy(policy)) || isCreatingTrackExpense ? (policy?.defaultReimbursable ?? true) : true;
        setMoneyRequestReimbursable(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, defaultReimbursable);
    }, [policy, isPolicyExpenseChat, isCreatingTrackExpense]);

    const setBillable = useCallback((billable: boolean) => {
        setMoneyRequestBillable(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, billable);
    }, []);

    const setReimbursable = useCallback((reimbursable: boolean) => {
        setMoneyRequestReimbursable(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reimbursable);
    }, []);

    const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
    const transactionAmount = transaction?.amount ?? 0;
    const transactionTaxAmount = transaction?.taxAmount ?? 0;
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);
    const taxCode = (transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxCode = resolveCurrentTaxCode(policy, taxCode);
    const transactionTaxValue = transaction?.taxValue ?? getTaxValue(policy, transaction, transactionTaxCode) ?? '';
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const existingTransactionID = getExistingTransactionID(transaction?.linkedTrackedExpenseReportAction);
    const [storedTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(existingTransactionID)}`);
    const listOfParticipants = participants.filter((participant) => participant.selected);
    const participant = listOfParticipants.at(0) ?? selectedParticipants.at(0);
    const reportToSubmit = resolveReportForMoneyRequest({transaction, transactionReport, routeReport: report, policy, reportNameValuePair});
    const postSubmitNavigationReportID = (isSelfDM(report) ? report : reportToSubmit)?.reportID ?? reportOrAccountID;
    const isIouReport = isMoneyRequestReport(reportToSubmit);
    const policyTagsForRequestMoney = useMoneyRequestPolicyTags({
        moneyRequestReportID: isIouReport ? reportToSubmit?.reportID : undefined,
        parentChatReportPolicyID: reportToSubmit?.policyID,
        participantReportID: participant?.reportID,
    });

    const hasNavigationDestination = !!transaction && !!postSubmitNavigationReportID;
    // Empty draft skips REPORT_DRAFT fallback — report must be in COLLECTION.REPORT to render behind the share modal.
    const destinationReportInCollection = hasNavigationDestination ? getReportOrDraftReport(postSubmitNavigationReportID, undefined, undefined, {}) : undefined;
    // Destination report isn't in COLLECTION.REPORT yet (e.g. a recipient with no existing chat) — it will only
    // exist after the expense create writes it optimistically, so pre-mounting is impossible.
    const isDestinationReportMissing = hasNavigationDestination && !destinationReportInCollection?.reportID;
    // Keep pre-mount off while pending navigation owns the reveal — otherwise once the optimistic
    // report lands, isDestinationReportMissing flips false and usePreMountDestination would schedule
    // a narrow pre-insert alongside the pending revealRouteBeforeDismissingModal (dual nav).
    const preMountDestinationRoute = getSubmitExpensePreMountDestinationRoute({
        isTransactionReady: hasNavigationDestination && !isDestinationReportMissing && !pendingNavigationReportID,
        destinationReportID: postSubmitNavigationReportID,
        destinationReport: destinationReportInCollection,
        isFromGlobalCreate: false,
        canPreInsertSearch: false,
        iouType,
        isCreatingTrackExpense,
        isSelfDMDestination: isSelfDM(report),
        isLookingAroundUser,
        isMovingTransactionFromTrackExpense: false,
    });

    const {reveal: revealPreMountDestination, cleanupPreMount} = usePreMountDestination(preMountDestinationRoute, {
        shouldPreservePreInsertedRouteOnUnmount: () => hasCalledReveal.current,
    });

    // Single entry point for the pending-navigation reveal — the ref guard makes it safe to call from either
    // path below, so whichever fires first wins and the other becomes a no-op.
    const revealPendingNavigation = (reportID: string) => {
        if (hasStartedPendingNavigation.current) {
            return;
        }
        hasStartedPendingNavigation.current = true;
        Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(reportID), {
            afterTransition: () => {
                setIsConfirming(false);
            },
        });
    };

    // Once the optimistically created destination report lands in Onyx, reveal it directly over the modal —
    // navigating before it exists would dismiss to the inbox and flash it while the report screen mounts.
    useEffect(() => {
        if (!pendingNavigationReportID || !pendingNavigationReport?.reportID) {
            return;
        }
        revealPendingNavigation(pendingNavigationReportID);
    }, [pendingNavigationReportID, pendingNavigationReport?.reportID, revealPendingNavigation]);

    // Fallback: if optimistic report lands under different ID, still reveal to intended destination after timeout.
    useEffect(() => {
        if (!pendingNavigationReportID || hasStartedPendingNavigation.current || pendingNavigationReport?.reportID) {
            return;
        }

        const timeoutId = setTimeout(() => revealPendingNavigation(pendingNavigationReportID), 500);

        return () => clearTimeout(timeoutId);
    }, [pendingNavigationReportID, pendingNavigationReport?.reportID, revealPendingNavigation]);

    // Timeout for pending report arrival — if optimistic write doesn't land within 5s, something's broken anyway.
    // Fallback dismisses spinner and lets user navigate back without indefinite hang.
    useEffect(() => {
        if (!pendingNavigationReportID) {
            return;
        }

        const timeoutId = setTimeout(() => {
            setIsConfirming(false);
        }, 5000);

        return () => clearTimeout(timeoutId);
    }, [pendingNavigationReportID]);

    const finishRequestAndNavigate = (receipt: Receipt, gpsPoint?: GpsPoint) => {
        if (!transaction || !participant) {
            return;
        }

        // `transaction.transactionID` is the draft placeholder; mirror the action's `existingTransactionID ?? rand64()` chain so cleanup nav targets the created expense.
        const optimisticTransactionID = existingTransactionID ?? rand64();

        // This path skips createTransaction, so log the submit milestone here to map the draft id to the final one.
        logReceiptSubmitted({
            receiptTraceId: receipt.receiptTraceId,
            draftTransactionID: transaction.transactionID,
            transactionID: optimisticTransactionID,
            command: isSelfDM(report) ? WRITE_COMMANDS.TRACK_EXPENSE : WRITE_COMMANDS.REQUEST_MONEY,
            iouType,
        });

        const performExpenseCreate = () => {
            if (isSelfDM(report)) {
                trackExpense({
                    getCurrencyDecimals,
                    report: report ?? {reportID: reportOrAccountID},
                    isDraftPolicy: false,
                    isDraftChatReport: !!reportDraft,
                    participantParams: {payeeEmail: currentUserPersonalDetails.login, payeeAccountID: currentUserPersonalDetails.accountID, participant},
                    policyParams: {policy, policyTagList: policyTags, policyCategories},
                    action: CONST.IOU.TYPE.CREATE,
                    transactionParams: {
                        attendees: transaction.comment?.attendees,
                        amount: transactionAmount,
                        currency: transaction.currency,
                        comment: trimmedComment,
                        receipt,
                        category: transaction.category,
                        tag: transaction.tag,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        taxValue: transactionTaxValue,
                        billable: transaction.billable,
                        reimbursable: transaction.reimbursable,
                        merchant: transaction.merchant ?? '',
                        created: transaction.created,
                        actionableWhisperReportActionID: transaction.actionableWhisperReportActionID,
                        linkedTrackedExpenseReportAction: transaction.linkedTrackedExpenseReportAction,
                        linkedTrackedExpenseReportID: transaction.linkedTrackedExpenseReportID,
                        isLinkedTrackedExpenseReportArchived,
                        gpsPoint,
                    },
                    existingTransaction: transaction,
                    isASAPSubmitBetaEnabled,
                    currentUser: {accountID: currentUserPersonalDetails.accountID, email: currentUserPersonalDetails.login ?? ''},
                    introSelected,
                    conciergeChat,
                    quickAction,
                    recentWaypoints,
                    betas,
                    draftTransactionIDs,
                    isSelfTourViewed,
                    optimisticTransactionID,
                    currentUserLocalCurrency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
                    delegateAccountID,
                    reportActionsList: undefined,
                });
            } else {
                const existingTransactionDraft = existingTransactionID ? transactionDrafts?.[existingTransactionID] : undefined;

                requestMoney({
                    getCurrencyDecimals,
                    report: reportToSubmit,
                    participantParams: {payeeEmail: currentUserPersonalDetails.login, payeeAccountID: currentUserPersonalDetails.accountID, participant},
                    policyParams: {policy, policyTagList: policyTagsForRequestMoney, policyCategories, policyRecentlyUsedCategories, policyRecentlyUsedTags},
                    gpsPoint,
                    action: CONST.IOU.TYPE.CREATE,
                    transactionParams: {
                        attendees: transaction.comment?.attendees,
                        amount: transactionAmount,
                        currency: transaction.currency,
                        comment: trimmedComment,
                        receipt,
                        category: transaction.category,
                        tag: transaction.tag,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        taxValue: transactionTaxValue,
                        billable: transaction.billable,
                        reimbursable: transaction.reimbursable,
                        merchant: transaction.merchant ?? '',
                        created: transaction.created,
                        actionableWhisperReportActionID: transaction.actionableWhisperReportActionID,
                        linkedTrackedExpenseReportAction: transaction.linkedTrackedExpenseReportAction,
                        linkedTrackedExpenseReportID: transaction.linkedTrackedExpenseReportID,
                        isLinkedTrackedExpenseReportArchived,
                    },
                    shouldGenerateTransactionThreadReport: false,
                    isASAPSubmitBetaEnabled,
                    currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                    currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                    transactionViolations,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    quickAction,
                    existingTransactionDraft,
                    existingTransaction: storedTransaction ?? transaction,
                    draftTransactionIDs,
                    isSelfTourViewed,
                    conciergeChat,
                    betas,
                    personalDetails,
                    optimisticTransactionID,
                    isTrackIntentUser,
                    delegateAccountID,
                    formatPhoneNumber,
                    optimisticChatReportID: routeReportID,
                });
            }
        };

        const cleanupParams = {
            report: isSelfDM(report) ? report : reportToSubmit,
            action: CONST.IOU.ACTION.CREATE,
            draftTransactionIDs,
            transactionID: optimisticTransactionID,
            isFromGlobalCreate: getIsFromGlobalCreate(transaction),
            optimisticChatReportID: routeReportID,
            navigationReportID: postSubmitNavigationReportID,
            linkedTrackedExpenseReportAction: transaction.linkedTrackedExpenseReportAction,
            isLookingAroundUser,
            isSelfDMDestination: isSelfDM(report),
        };

        const runExpenseCreateAndCleanup = (shouldNavigate: boolean) => {
            performExpenseCreate();
            cleanupAndNavigateAfterExpenseCreate({...cleanupParams, shouldNavigate});
        };

        // Share never calls startTracking, so cancel any stale span from a prior flow to avoid the warning
        // at cleanupAndNavigateAfterExpenseCreate when shouldNavigate: false.
        cancelTracking();

        if (preMountDestinationRoute) {
            performExpenseCreate();
            hasCalledReveal.current = true;
            revealPreMountDestination(() => {
                cleanupAndNavigateAfterExpenseCreate({...cleanupParams, shouldNavigate: false});
                setIsConfirming(false);
            });
            return;
        }

        // Pre-mount wasn't possible because the destination report doesn't exist yet. Create the expense without
        // navigating — the optimistic write creates the report — and let the pending-navigation effect reveal it
        // once it lands. isConfirming stays true until the reveal transition ends, so the confirm button keeps
        // its loading state exactly like the pre-mounted path.
        if (isDestinationReportMissing) {
            runExpenseCreateAndCleanup(false);
            setPendingNavigationReportID(postSubmitNavigationReportID);
            return;
        }

        // Wide layout fallback: destination exists but is not topmost — reveal it via dismissal modal instead of pre-insert.
        const topmostReportId = Navigation.getTopmostReportId();
        if (topmostReportId !== postSubmitNavigationReportID) {
            performExpenseCreate();
            hasCalledReveal.current = true;
            Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(postSubmitNavigationReportID), {
                afterTransition: () => {
                    cleanupAndNavigateAfterExpenseCreate({...cleanupParams, shouldNavigate: false});
                    setIsConfirming(false);
                },
            });
            return;
        }

        runExpenseCreateAndCleanup(true);
    };

    const onSuccess = (file: File, locationPermissionGranted?: boolean) => {
        const receipt: Receipt = file;
        receipt.state = file && CONST.IOU.RECEIPT_STATE.SCAN_READY;
        // The share flow builds the receipt here by hand and skips buildReceiptFiles, so this is the only place to stamp
        // the trace id and log the capture.
        const receiptTraceId = mintAndStampReceiptTraceId(receipt);
        logReceiptCaptured({file: receipt, captureSource: 'share', receiptTraceId});
        if (!locationPermissionGranted) {
            finishRequestAndNavigate(receipt);
            return;
        }
        // Use cached userLocation when available — avoids an extra getCurrentPosition round-trip.
        if (userLocation) {
            finishRequestAndNavigate(receipt, {
                lat: userLocation.latitude,
                long: userLocation.longitude,
            });
            return;
        }
        getCurrentPosition(
            (successData) => {
                finishRequestAndNavigate(receipt, {
                    lat: successData.coords.latitude,
                    long: successData.coords.longitude,
                });
            },
            (errorData) => {
                Log.info('[SubmitDetailsPage] getCurrentPosition failed', false, errorData);
                finishRequestAndNavigate(receipt);
            },
        );
    };

    // Separate helper so the permission-modal callbacks don't re-enter onConfirm (deadlocked when OS permission was pre-granted).
    const performUpload = (locationPermissionGranted: boolean) => {
        // Block confirm until the async HEIC→JPEG conversion has landed in VALIDATED_FILE_OBJECT, so a fast tap can't
        // submit the raw file. Clearing isConfirming keeps the button from getting stuck, so a retry succeeds once ready.
        if (formHasBeenSubmitted.current || !currentAttachment || (shouldUsePreValidatedFile && !validFilesToUpload)) {
            setIsConfirming(false);
            return;
        }
        formHasBeenSubmitted.current = true;
        // Nothing ever deletes from ReceiptStorage, so we only adopt once the user submits. A cancelled share stays in
        // the share extension's own folder, which the next share wipes.
        ReceiptStorage.adopt(currentReceiptSource, currentReceiptName)
            .then((durableName) => {
                const uri = ReceiptStorage.toLocalUri(durableName);
                // The shared path is empty once the move lands, and the draft is what a retry re-reads.
                setMoneyRequestReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, uri, currentReceiptName, true, currentReceiptType);
                return uri;
            })
            .catch((error: unknown) => {
                logReceiptAdoptFailed({error, captureSource: 'share'});
                return currentReceiptSource;
            })
            .then((uri) =>
                readFileAsync(
                    uri,
                    currentReceiptName,
                    (file) => onSuccess(file, locationPermissionGranted),
                    () => {
                        formHasBeenSubmitted.current = false;
                        setIsConfirming(false);
                    },
                    currentReceiptType,
                ),
            );
    };

    const onConfirm = (gpsRequired?: boolean) => {
        setIsConfirming(true);
        const shouldStartLocationPermissionFlow =
            gpsRequired &&
            (!lastLocationPermissionPrompt ||
                (DateUtils.isValidDateString(lastLocationPermissionPrompt ?? '') &&
                    DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? '')) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS));

        if (shouldStartLocationPermissionFlow) {
            setStartLocationPermissionFlow(true);
            return;
        }

        if (!participant) {
            setIsConfirming(false);
            return;
        }
        performUpload(false);
    };

    return (
        <ScreenWrapper testID="SubmitDetailsPage">
            <FullPageNotFoundView shouldShow={!reportOrAccountID}>
                <DraftWorkspaceOpener
                    isCreatingTrackExpense={isCreatingTrackExpense}
                    policyID={policy?.id}
                    policyPendingAction={policy?.pendingAction}
                    policyExpenseChatPolicyID={policyExpenseChatPolicyID}
                    senderPolicyID={senderPolicyID}
                    isOffline={isOffline}
                />
                <HeaderWithBackButton
                    title={translate('iou.confirmDetails')}
                    onBackButtonPress={() => {
                        cleanupPreMount();
                        Navigation.goBack();
                    }}
                />
                <LocationPermissionModal
                    startPermissionFlow={startLocationPermissionFlow}
                    resetPermissionFlow={() => {
                        setStartLocationPermissionFlow(false);
                        setIsConfirming(false);
                    }}
                    onGrant={() => {
                        setStartLocationPermissionFlow(false);
                        if (!participant) {
                            setIsConfirming(false);
                            return;
                        }
                        performUpload(true);
                    }}
                    onDeny={(wasUserInitiated) => {
                        setStartLocationPermissionFlow(false);
                        if (wasUserInitiated) {
                            updateLastLocationPermissionPrompt();
                        }
                        if (!participant) {
                            setIsConfirming(false);
                            return;
                        }
                        performUpload(false);
                    }}
                    onInitialGetLocationCompleted={() => setIsConfirming(false)}
                />
                <View
                    style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}
                    onLayout={endOpenSubmitFlowSpan}
                >
                    <MoneyRequestConfirmationList
                        transaction={transaction}
                        selectedParticipants={participants}
                        iouType={iouType}
                        onToggleBillable={setBillable}
                        onToggleReimbursable={setReimbursable}
                        isPolicyExpenseChat={isPolicyExpenseChat}
                        policyID={policy?.id}
                        isConfirming={isConfirming}
                        onConfirm={() => onConfirm(true)}
                        receiptPath={currentReceiptSource}
                        receiptFilename={currentReceiptName}
                        reportID={reportOrAccountID}
                        shouldShowSmartScanFields={false}
                        shouldDisplayReceipt
                        isReceiptEditable
                        action={CONST.IOU.ACTION.CREATE}
                        onPDFLoadError={() => {
                            if (errorTitle) {
                                return;
                            }
                            setErrorTitle(translate('attachmentPicker.attachmentError'));
                            setErrorMessage(translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
                        }}
                        onPDFPassword={() => {
                            if (errorTitle) {
                                return;
                            }
                            setErrorTitle(translate('attachmentPicker.attachmentError'));
                            setErrorMessage(translate('attachmentPicker.protectedPDFNotSupported'));
                        }}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default SubmitDetailsPage;
