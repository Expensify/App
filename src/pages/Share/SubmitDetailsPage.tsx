import type {StackScreenProps} from '@react-navigation/stack';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LocationPermissionModal from '@components/LocationPermissionModal';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import type {GpsPoint} from '@libs/actions/IOU';
import {
    getIOURequestPolicyID,
    getMoneyRequestParticipantsFromReport,
    initMoneyRequest,
    setMoneyRequestBillable,
    setMoneyRequestReimbursable,
    updateLastLocationPermissionPrompt,
} from '@libs/actions/IOU';
import {setMoneyRequestReceipt} from '@libs/actions/IOU/Receipt';
import {requestMoney, trackExpense} from '@libs/actions/IOU/TrackExpense';
import DateUtils from '@libs/DateUtils';
import {getFileName, readFileAsync} from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import {getExistingTransactionID} from '@libs/IOUUtils';
import Log from '@libs/Log';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import Navigation from '@libs/Navigation/Navigation';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {shouldValidateFile} from '@libs/ReceiptUtils';
import {getReportOrDraftReport, isSelfDM} from '@libs/ReportUtils';
import {getDefaultTaxCode, getTaxValue} from '@libs/TransactionUtils';
import DraftWorkspaceOpener from '@pages/iou/request/step/confirmation/DraftWorkspaceOpener';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report as ReportType} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {Receipt} from '@src/types/onyx/Transaction';
import {showErrorAlert} from './ShareRootPage';
import useShareFileSizeValidation from './useShareFileSizeValidation';

type ShareDetailsPageProps = StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SUBMIT_DETAILS>;
function SubmitDetailsPage({
    route: {
        params: {reportOrAccountID},
    },
}: ShareDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [unknownUserDetails] = useOnyx(ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS);
    const [personalDetails] = useOnyx(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`);
    const report: OnyxEntry<ReportType> = getReportOrDraftReport(reportOrAccountID);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);
    const iouType = isSelfDM(report) ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;
    // Self-DM has a FAKE report policyID — usePolicyForTransaction (same hook MoneyRequestConfirmationList uses) returns the active workspace for self-DM track expense, covering the upgrade-from-free flow.
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: getIOURequestPolicyID(transaction, report),
        action: CONST.IOU.ACTION.CREATE,
        iouType,
        isPerDiemRequest: false,
    });
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getIOURequestPolicyID(transaction, report)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getIOURequestPolicyID(transaction, report)}`);
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const reportAttributesDerived = useReportAttributes();
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const [validFilesToUpload] = useOnyx(ONYXKEYS.VALIDATED_FILE_OBJECT);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${getIOURequestPolicyID(transaction, report)}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${getIOURequestPolicyID(transaction, report)}`);
    const [currentAttachment] = useOnyx(ONYXKEYS.SHARE_TEMP_FILE);
    const shouldUsePreValidatedFile = shouldValidateFile(currentAttachment);
    const isLinkedTrackedExpenseReportArchived = useReportIsArchived(transaction?.linkedTrackedExpenseReportID);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const draftTransactionIDs = Object.keys(transactionDrafts ?? {});

    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalPolicy = usePersonalPolicy();
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [selectedParticipantList, setSelectedParticipantList] = useState<Participant[]>([]);
    const [isConfirming, setIsConfirming] = useState(false);
    const formHasBeenSubmitted = useRef(false);
    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);

    const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const {isBetaEnabled} = usePermissions();
    const fileUri = shouldUsePreValidatedFile ? (validFilesToUpload?.uri ?? '') : (currentAttachment?.content ?? '');
    const fileName = shouldUsePreValidatedFile ? getFileName(validFilesToUpload?.uri ?? CONST.ATTACHMENT_IMAGE_DEFAULT_NAME) : getFileName(currentAttachment?.content ?? '');
    const fileType = shouldUsePreValidatedFile ? (validFilesToUpload?.type ?? CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG) : (currentAttachment?.mimeType ?? '');
    const [hasOnlyPersonalPolicies = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasOnlyPersonalPoliciesUtil});

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
            currentUserPersonalDetails,
            hasOnlyPersonalPolicies,
            draftTransactionIDs,
        });
        // initMoneyRequest is an imported action, intentionally excluded to avoid re-initializing on every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportOrAccountID, policy, personalPolicy, report, parentReport, currentDate, currentUserPersonalDetails, hasOnlyPersonalPolicies]);

    const sharedFileSource = currentAttachment?.content ?? fileUri;
    const sharedFileName = getFileName(currentAttachment?.content ?? '') || fileName;
    const sharedFileType = currentAttachment?.mimeType ?? fileType;

    // Seed the transaction draft so isScanRequest() returns true and compact mode / "Automatic" labels / receipt rendering work.
    useEffect(() => {
        if (!sharedFileSource) {
            return;
        }
        setMoneyRequestReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, sharedFileSource, sharedFileName, true, sharedFileType);
    }, [sharedFileSource, sharedFileName, sharedFileType]);

    // The current receipt — prefers the transaction draft (reflects Replace/Crop), falls back to the shared file; used for both display and upload so they stay in sync.
    const currentReceiptSource = typeof transaction?.receipt?.source === 'string' ? transaction.receipt.source : sharedFileSource;
    // Strip filesystem path segments without URL-decoding — getFileName() decodes via decodeURIComponent and would throw on raw filenames containing a literal '%' (e.g., "Receipt 100%.jpg").
    const currentReceiptName = (transaction?.receipt?.filename?.split('/').pop() ?? '') || sharedFileName;
    const currentReceiptType = transaction?.receipt?.type ?? sharedFileType;

    // Validate the same source that performUpload reads — so Replace/Crop to an oversized file is still caught before submit.
    useShareFileSizeValidation(currentReceiptSource, setErrorTitle, setErrorMessage, !errorTitle);

    const selectedParticipants = unknownUserDetails ? [unknownUserDetails] : getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID);
    const participants = selectedParticipants.map((participant) => {
        const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`];
        return participant?.accountID
            ? getParticipantsOption(participant, personalDetails)
            : getReportOption(participant, privateIsArchived, policy, personalDetails, conciergeReportID, reportAttributesDerived);
    });

    const isPolicyExpenseChat = useMemo(() => participants?.some((participant) => participant.isPolicyExpenseChat), [participants]);
    const policyExpenseChatPolicyID = participants?.find((participant) => participant.isPolicyExpenseChat)?.policyID;
    const senderPolicyID = participants?.find((participant) => !!participant && 'isSender' in participant && participant.isSender)?.policyID;
    const {isOffline} = useNetwork();
    const isCreatingTrackExpense = iouType === CONST.IOU.TYPE.TRACK;

    // Initialize billable/reimbursable from policy defaults (mirrors IOURequestStepConfirmation)
    const defaultBillable = !!policy?.defaultBillable;
    useEffect(() => {
        setMoneyRequestBillable(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, defaultBillable);
    }, [defaultBillable]);

    useEffect(() => {
        const defaultReimbursable = (isPolicyExpenseChat && isPaidGroupPolicy(policy)) || isCreatingTrackExpense ? (policy?.defaultReimbursable ?? true) : true;
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
    const transactionTaxCode = (transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxValue = transaction?.taxValue ?? getTaxValue(policy, transaction, transactionTaxCode) ?? '';
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);

    const finishRequestAndNavigate = (participant: Participant, receipt: Receipt, gpsPoint?: GpsPoint) => {
        if (!transaction) {
            return;
        }

        if (isSelfDM(report)) {
            trackExpense({
                report: report ?? {reportID: reportOrAccountID},
                isDraftPolicy: false,
                participantParams: {payeeEmail: currentUserPersonalDetails.login, payeeAccountID: currentUserPersonalDetails.accountID, participant},
                policyParams: {policy, policyTagList: policyTags, policyCategories},
                action: CONST.IOU.TYPE.CREATE,
                transactionParams: {
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
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                activePolicyID,
                introSelected,
                quickAction,
                recentWaypoints,
                betas,
                draftTransactionIDs,
                isSelfTourViewed,
            });
        } else {
            const existingTransactionID = getExistingTransactionID(transaction.linkedTrackedExpenseReportAction);
            const existingTransactionDraft = existingTransactionID ? transactionDrafts?.[existingTransactionID] : undefined;

            requestMoney({
                report,
                participantParams: {payeeEmail: currentUserPersonalDetails.login, payeeAccountID: currentUserPersonalDetails.accountID, participant},
                policyParams: {policy, policyTagList: policyTags, policyCategories, policyRecentlyUsedCategories, policyRecentlyUsedTags},
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
                draftTransactionIDs,
                isSelfTourViewed,
                betas,
                personalDetails,
            });
        }
    };

    const onSuccess = (participant: Participant, file: File, locationPermissionGranted?: boolean) => {
        const receipt: Receipt = file;
        receipt.state = file && CONST.IOU.RECEIPT_STATE.SCAN_READY;
        if (!locationPermissionGranted) {
            finishRequestAndNavigate(participant, receipt);
            return;
        }
        // Use cached userLocation when available — avoids an extra getCurrentPosition round-trip.
        if (userLocation) {
            finishRequestAndNavigate(participant, receipt, {
                lat: userLocation.latitude,
                long: userLocation.longitude,
            });
            return;
        }
        getCurrentPosition(
            (successData) => {
                finishRequestAndNavigate(participant, receipt, {
                    lat: successData.coords.latitude,
                    long: successData.coords.longitude,
                });
            },
            (errorData) => {
                Log.info('[SubmitDetailsPage] getCurrentPosition failed', false, errorData);
                finishRequestAndNavigate(participant, receipt);
            },
        );
    };

    // Extracted from onConfirm — re-entering onConfirm from the permission modal deadlocked when OS permission was pre-granted.
    const performUpload = (participant: Participant, locationPermissionGranted: boolean) => {
        if (formHasBeenSubmitted.current || !currentAttachment) {
            setIsConfirming(false);
            return;
        }
        formHasBeenSubmitted.current = true;
        readFileAsync(
            currentReceiptSource,
            currentReceiptName,
            (file) => onSuccess(participant, file, locationPermissionGranted),
            () => {
                // Allow retry after a file-read failure.
                formHasBeenSubmitted.current = false;
                setIsConfirming(false);
            },
            currentReceiptType,
        );
    };

    const onConfirm = (listOfParticipants?: Participant[], gpsRequired?: boolean) => {
        setIsConfirming(true);
        const shouldStartLocationPermissionFlow =
            gpsRequired &&
            (!lastLocationPermissionPrompt ||
                (DateUtils.isValidDateString(lastLocationPermissionPrompt ?? '') &&
                    DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? '')) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS));

        if (shouldStartLocationPermissionFlow) {
            setSelectedParticipantList(listOfParticipants ?? selectedParticipants);
            setStartLocationPermissionFlow(true);
            return;
        }

        const participant = listOfParticipants?.at(0) ?? selectedParticipants.at(0);
        if (!participant) {
            setIsConfirming(false);
            return;
        }
        performUpload(participant, false);
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
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <LocationPermissionModal
                    startPermissionFlow={startLocationPermissionFlow}
                    resetPermissionFlow={() => {
                        setStartLocationPermissionFlow(false);
                        setIsConfirming(false);
                    }}
                    onGrant={() => {
                        setStartLocationPermissionFlow(false);
                        const participant = selectedParticipantList.at(0) ?? selectedParticipants.at(0);
                        if (!participant) {
                            setIsConfirming(false);
                            return;
                        }
                        navigateAfterInteraction(() => performUpload(participant, true));
                    }}
                    onDeny={() => {
                        updateLastLocationPermissionPrompt();
                        setStartLocationPermissionFlow(false);
                        const participant = selectedParticipantList.at(0) ?? selectedParticipants.at(0);
                        if (!participant) {
                            setIsConfirming(false);
                            return;
                        }
                        navigateAfterInteraction(() => performUpload(participant, false));
                    }}
                    onInitialGetLocationCompleted={() => setIsConfirming(false)}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <MoneyRequestConfirmationList
                        transaction={transaction}
                        selectedParticipants={participants}
                        iouType={iouType}
                        onToggleBillable={setBillable}
                        onToggleReimbursable={setReimbursable}
                        isPolicyExpenseChat={isPolicyExpenseChat}
                        policyID={policy?.id}
                        isConfirming={isConfirming}
                        onConfirm={(updatedParticipants) => onConfirm(updatedParticipants, true)}
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
