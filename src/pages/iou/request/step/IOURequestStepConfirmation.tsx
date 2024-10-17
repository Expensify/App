import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import LocationPermissionModal from '@components/LocationPermissionModal';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFetchRoute from '@hooks/useFetchRoute';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DateUtils from '@libs/DateUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import * as IOUUtils from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import {openDraftWorkspaceRequest} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepConfirmationProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION>;

function IOURequestStepConfirmation({
    report: reportReal,
    reportDraft,
    route: {
        params: {iouType, reportID, transactionID, action, participantsAutoAssigned: participantsAutoAssignedFromRoute},
    },
    transaction,
}: IOURequestStepConfirmationProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;

    const policyIDForReal = IOU.getIOURequestPolicyID(transaction, reportReal ?? reportDraft);
    const policyIDForDraft = IOU.getIOURequestPolicyID(transaction, reportDraft);

    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyIDForReal}`);
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyIDForDraft}`);
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyIDForReal}`);
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyIDForDraft}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyIDForReal}`);

    const report = reportReal ?? reportDraft;
    // Check if the real policy exists for either reportReal or reportDraft
    const policy = policyReal ?? policyDraft;
    const policyCategories = policyCategoriesReal ?? policyCategoriesDraft;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [selectedParticipantList, setSelectedParticipantList] = useState<Participant[]>([]);

    const [receiptFile, setReceiptFile] = useState<OnyxEntry<Receipt>>();
    const requestType = TransactionUtils.getRequestType(transaction);
    const isDistanceRequest = requestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT);

    const receiptFilename = transaction?.filename;
    const receiptPath = transaction?.receipt?.source;
    const receiptType = transaction?.receipt?.type;
    const customUnitRateID = TransactionUtils.getRateID(transaction) ?? '';
    const defaultTaxCode = TransactionUtils.getDefaultTaxCode(policy, transaction);
    const transactionTaxCode = (transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = transaction?.taxAmount ?? 0;
    const isSharingTrackExpense = action === CONST.IOU.ACTION.SHARE;
    const isCategorizingTrackExpense = action === CONST.IOU.ACTION.CATEGORIZE;
    const isSubmittingFromTrackExpense = action === CONST.IOU.ACTION.SUBMIT;
    const isMovingTransactionFromTrackExpense = IOUUtils.isMovingTransactionFromTrackExpense(action);
    const payeePersonalDetails = useMemo(() => {
        if (personalDetails?.[transaction?.splitPayerAccountIDs?.[0] ?? -1]) {
            return personalDetails?.[transaction?.splitPayerAccountIDs?.[0] ?? -1];
        }

        const participant = transaction?.participants?.find((val) => val.accountID === (transaction?.splitPayerAccountIDs?.[0] ?? -1));

        return {
            login: participant?.login ?? '',
            accountID: participant?.accountID ?? -1,
            avatar: Expensicons.FallbackAvatar,
            displayName: participant?.login ?? '',
            isOptimisticPersonalDetail: true,
        };
    }, [personalDetails, transaction?.participants, transaction?.splitPayerAccountIDs]);

    const gpsRequired = transaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && receiptFile;
    const [isConfirmed, setIsConfirmed] = useState(false);

    const headerTitle = useMemo(() => {
        if (isCategorizingTrackExpense) {
            return translate('iou.categorize');
        }
        if (isSubmittingFromTrackExpense) {
            return translate('iou.submitExpense');
        }
        if (isSharingTrackExpense) {
            return translate('iou.share');
        }
        if (iouType === CONST.IOU.TYPE.SPLIT) {
            return translate('iou.splitExpense');
        }
        if (iouType === CONST.IOU.TYPE.TRACK) {
            return translate('iou.trackExpense');
        }
        if (iouType === CONST.IOU.TYPE.PAY) {
            return translate('iou.paySomeone', {name: ReportUtils.getPayeeName(report)});
        }
        if (iouType === CONST.IOU.TYPE.INVOICE) {
            return translate('workspace.invoices.sendInvoice');
        }
        return translate('iou.submitExpense');
    }, [iouType, report, translate, isSharingTrackExpense, isCategorizingTrackExpense, isSubmittingFromTrackExpense]);

    const participants = useMemo(
        () =>
            transaction?.participants?.map((participant) => {
                if (participant.isSender && iouType === CONST.IOU.TYPE.INVOICE) {
                    return participant;
                }
                return participant.accountID ? OptionsListUtils.getParticipantsOption(participant, personalDetails) : OptionsListUtils.getReportOption(participant);
            }) ?? [],
        [transaction?.participants, personalDetails, iouType],
    );
    const isPolicyExpenseChat = useMemo(() => participants?.some((participant) => participant.isPolicyExpenseChat), [participants]);
    const formHasBeenSubmitted = useRef(false);

    useFetchRoute(transaction, transaction?.comment?.waypoints, action);

    useEffect(() => {
        const policyExpenseChat = participants?.find((participant) => participant.isPolicyExpenseChat);
        if (policyExpenseChat?.policyID && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            openDraftWorkspaceRequest(policyExpenseChat.policyID);
        }
        const senderPolicyParticipant = participants?.find((participant) => !!participant && 'isSender' in participant && participant.isSender);
        if (senderPolicyParticipant?.policyID && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            openDraftWorkspaceRequest(senderPolicyParticipant.policyID);
        }
    }, [isOffline, participants, policy?.pendingAction]);

    const defaultBillable = !!policy?.defaultBillable;
    useEffect(() => {
        IOU.setMoneyRequestBillable(transactionID, defaultBillable);
    }, [transactionID, defaultBillable]);

    useEffect(() => {
        if (!transaction?.category) {
            return;
        }
        if (policyCategories?.[transaction.category] && !policyCategories[transaction.category].enabled) {
            IOU.setMoneyRequestCategory(transactionID, '');
        }
    }, [policyCategories, transaction?.category, transactionID]);

    const policyDistance = Object.values(policy?.customUnits ?? {}).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const defaultCategory = policyDistance?.defaultCategory ?? '';

    useEffect(() => {
        if (requestType !== CONST.IOU.REQUEST_TYPE.DISTANCE || !!transaction?.category) {
            return;
        }
        IOU.setMoneyRequestCategory(transactionID, defaultCategory);
        // Prevent resetting to default when unselect category
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [transactionID, requestType, defaultCategory]);

    const navigateBack = useCallback(() => {
        // If the action is categorize and there's no policies other than personal one, we simply call goBack(), i.e: dismiss the whole flow together
        // We don't need to subscribe to policy_ collection as we only need to check on the latest collection value
        if (action === CONST.IOU.ACTION.CATEGORIZE && PolicyUtils.hasNoPolicyOtherThanPersonalType()) {
            Navigation.goBack();
            return;
        }
        // If there is not a report attached to the IOU with a reportID, then the participants were manually selected and the user needs taken
        // back to the participants step
        if (!transaction?.participantsAutoAssigned && participantsAutoAssignedFromRoute !== 'true') {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, transaction?.reportID || reportID, undefined, action));
            return;
        }
        IOUUtils.navigateToStartMoneyRequestStep(requestType, iouType, transactionID, reportID, action);
    }, [transaction, iouType, requestType, transactionID, reportID, action, participantsAutoAssignedFromRoute]);

    const navigateToAddReceipt = useCallback(() => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
    }, [iouType, transactionID, reportID, action]);

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const isLocalFile = FileUtils.isLocalFile(receiptPath);

        if (!isLocalFile) {
            setReceiptFile(transaction?.receipt);
            return;
        }

        const onSuccess = (file: File) => {
            const receipt: Receipt = file;
            receipt.state = file && requestType === CONST.IOU.REQUEST_TYPE.MANUAL ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCANREADY;
            setReceiptFile(receipt);
        };

        IOU.navigateToStartStepIfScanFileCannotBeRead(receiptFilename, receiptPath, onSuccess, requestType, iouType, transactionID, reportID, receiptType);
    }, [receiptType, receiptPath, receiptFilename, requestType, iouType, transactionID, reportID, action, transaction?.receipt]);

    const requestMoney = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string, receiptObj?: Receipt, gpsPoints?: IOU.GpsPoint) => {
            if (!transaction) {
                return;
            }

            const participant = selectedParticipants.at(0);
            if (!participant) {
                return;
            }

            IOU.requestMoney(
                report,
                transaction.amount,
                transaction.currency,
                transaction.created,
                transaction.merchant,
                currentUserPersonalDetails.login,
                currentUserPersonalDetails.accountID,
                participant,
                trimmedComment,
                receiptObj,
                transaction.category,
                transaction.tag,
                transactionTaxCode,
                transactionTaxAmount,
                transaction.billable,
                policy,
                policyTags,
                policyCategories,
                gpsPoints,
                action,
                transaction.actionableWhisperReportActionID,
                transaction.linkedTrackedExpenseReportAction,
                transaction.linkedTrackedExpenseReportID,
            );
        },
        [report, transaction, transactionTaxCode, transactionTaxAmount, currentUserPersonalDetails.login, currentUserPersonalDetails.accountID, policy, policyTags, policyCategories, action],
    );

    const trackExpense = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string, receiptObj?: OnyxEntry<Receipt>, gpsPoints?: IOU.GpsPoint) => {
            if (!report || !transaction) {
                return;
            }
            const participant = selectedParticipants.at(0);
            if (!participant) {
                return;
            }
            IOU.trackExpense(
                report,
                transaction.amount,
                transaction.currency,
                transaction.created,
                transaction.merchant,
                currentUserPersonalDetails.login,
                currentUserPersonalDetails.accountID,
                participant,
                trimmedComment,
                receiptObj,
                transaction.category,
                transaction.tag,
                transactionTaxCode,
                transactionTaxAmount,
                transaction.billable,
                policy,
                policyTags,
                policyCategories,
                gpsPoints,
                Object.keys(transaction?.comment?.waypoints ?? {}).length ? TransactionUtils.getValidWaypoints(transaction.comment?.waypoints, true) : undefined,
                action,
                transaction.actionableWhisperReportActionID,
                transaction.linkedTrackedExpenseReportAction,
                transaction.linkedTrackedExpenseReportID,
                customUnitRateID,
            );
        },
        [
            report,
            transaction,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            transactionTaxCode,
            transactionTaxAmount,
            policy,
            policyTags,
            policyCategories,
            action,
            customUnitRateID,
        ],
    );

    const createDistanceRequest = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string) => {
            if (!transaction) {
                return;
            }
            IOU.createDistanceRequest(
                report,
                selectedParticipants,
                trimmedComment,
                transaction.created,
                transaction.category,
                transaction.tag,
                transactionTaxCode,
                transactionTaxAmount,
                transaction.amount,
                transaction.currency,
                transaction.merchant,
                transaction.billable,
                TransactionUtils.getValidWaypoints(transaction.comment?.waypoints, true),
                policy,
                policyTags,
                policyCategories,
                customUnitRateID,
                currentUserPersonalDetails.login,
                currentUserPersonalDetails.accountID,
                transaction.splitShares,
                iouType,
                transaction,
            );
        },
        [policy, policyCategories, policyTags, report, transaction, transactionTaxCode, transactionTaxAmount, customUnitRateID, currentUserPersonalDetails, iouType],
    );

    const createTransaction = useCallback(
        (selectedParticipants: Participant[], locationPermissionGranted = false) => {
            setIsConfirmed(true);
            let splitParticipants = selectedParticipants;

            // Filter out participants with an amount equal to O
            if (iouType === CONST.IOU.TYPE.SPLIT && transaction?.splitShares) {
                const participantsWithAmount = Object.keys(transaction.splitShares ?? {})
                    .filter((accountID: string): boolean => (transaction?.splitShares?.[Number(accountID)]?.amount ?? 0) > 0)
                    .map((accountID) => Number(accountID));
                splitParticipants = selectedParticipants.filter((participant) =>
                    participantsWithAmount.includes(participant.isPolicyExpenseChat ? participant?.ownerAccountID ?? -1 : participant.accountID ?? -1),
                );
            }
            const trimmedComment = transaction?.comment?.comment?.trim() ?? '';

            // Don't let the form be submitted multiple times while the navigator is waiting to take the user to a different page
            if (formHasBeenSubmitted.current) {
                return;
            }

            formHasBeenSubmitted.current = true;
            playSound(SOUNDS.DONE);

            if (iouType !== CONST.IOU.TYPE.TRACK && isDistanceRequest && !isMovingTransactionFromTrackExpense) {
                createDistanceRequest(iouType === CONST.IOU.TYPE.SPLIT ? splitParticipants : selectedParticipants, trimmedComment);
                return;
            }

            // If we have a receipt let's start the split expense by creating only the action, the transaction, and the group DM if needed
            if (iouType === CONST.IOU.TYPE.SPLIT && receiptFile) {
                if (currentUserPersonalDetails.login && !!transaction) {
                    IOU.startSplitBill({
                        participants: selectedParticipants,
                        currentUserLogin: currentUserPersonalDetails.login,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        comment: trimmedComment,
                        receipt: receiptFile,
                        existingSplitChatReportID: report?.reportID,
                        billable: transaction.billable,
                        category: transaction.category,
                        tag: transaction.tag,
                        currency: transaction.currency,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                    });
                }
                return;
            }

            // IOUs created from a group report will have a reportID param in the route.
            // Since the user is already viewing the report, we don't need to navigate them to the report
            if (iouType === CONST.IOU.TYPE.SPLIT && !transaction?.isFromGlobalCreate) {
                if (currentUserPersonalDetails.login && !!transaction) {
                    IOU.splitBill({
                        participants: splitParticipants,
                        currentUserLogin: currentUserPersonalDetails.login,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        amount: transaction.amount,
                        comment: trimmedComment,
                        currency: transaction.currency,
                        merchant: transaction.merchant,
                        created: transaction.created,
                        category: transaction.category,
                        tag: transaction.tag,
                        existingSplitChatReportID: report?.reportID,
                        billable: transaction.billable,
                        iouRequestType: transaction.iouRequestType,
                        splitShares: transaction.splitShares,
                        splitPayerAccountIDs: transaction.splitPayerAccountIDs ?? [],
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                    });
                }
                return;
            }

            // If the split expense is created from the global create menu, we also navigate the user to the group report
            if (iouType === CONST.IOU.TYPE.SPLIT) {
                if (currentUserPersonalDetails.login && !!transaction) {
                    IOU.splitBillAndOpenReport({
                        participants: splitParticipants,
                        currentUserLogin: currentUserPersonalDetails.login,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        amount: transaction.amount,
                        comment: trimmedComment,
                        currency: transaction.currency,
                        merchant: transaction.merchant,
                        created: transaction.created,
                        category: transaction.category,
                        tag: transaction.tag,
                        billable: !!transaction.billable,
                        iouRequestType: transaction.iouRequestType,
                        splitShares: transaction.splitShares,
                        splitPayerAccountIDs: transaction.splitPayerAccountIDs,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                    });
                }
                return;
            }

            if (iouType === CONST.IOU.TYPE.INVOICE) {
                IOU.sendInvoice(currentUserPersonalDetails.accountID, transaction, report, receiptFile, policy, policyTags, policyCategories);
                return;
            }

            if (iouType === CONST.IOU.TYPE.TRACK || isCategorizingTrackExpense || isSharingTrackExpense) {
                if (receiptFile && transaction) {
                    // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                    if (transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted) {
                        getCurrentPosition(
                            (successData) => {
                                trackExpense(selectedParticipants, trimmedComment, receiptFile, {
                                    lat: successData.coords.latitude,
                                    long: successData.coords.longitude,
                                });
                            },
                            (errorData) => {
                                Log.info('[IOURequestStepConfirmation] getCurrentPosition failed', false, errorData);
                                // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                                trackExpense(selectedParticipants, trimmedComment, receiptFile);
                            },
                            {
                                maximumAge: CONST.GPS.MAX_AGE,
                                timeout: CONST.GPS.TIMEOUT,
                            },
                        );
                        return;
                    }

                    // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                    trackExpense(selectedParticipants, trimmedComment, receiptFile);
                    return;
                }
                trackExpense(selectedParticipants, trimmedComment, receiptFile);
                return;
            }

            if (receiptFile && !!transaction) {
                // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                if (transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted) {
                    getCurrentPosition(
                        (successData) => {
                            requestMoney(selectedParticipants, trimmedComment, receiptFile, {
                                lat: successData.coords.latitude,
                                long: successData.coords.longitude,
                            });
                        },
                        (errorData) => {
                            Log.info('[IOURequestStepConfirmation] getCurrentPosition failed', false, errorData);
                            // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                            requestMoney(selectedParticipants, trimmedComment, receiptFile);
                        },
                        {
                            maximumAge: CONST.GPS.MAX_AGE,
                            timeout: CONST.GPS.TIMEOUT,
                        },
                    );
                    return;
                }

                // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                requestMoney(selectedParticipants, trimmedComment, receiptFile);
                return;
            }

            requestMoney(selectedParticipants, trimmedComment);
        },
        [
            transaction,
            report,
            iouType,
            receiptFile,
            isDistanceRequest,
            requestMoney,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            trackExpense,
            createDistanceRequest,
            isSharingTrackExpense,
            isCategorizingTrackExpense,
            isMovingTransactionFromTrackExpense,
            policy,
            policyTags,
            policyCategories,
            transactionTaxAmount,
            transactionTaxCode,
        ],
    );

    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     */
    const sendMoney = useCallback(
        (paymentMethod: PaymentMethodType | undefined) => {
            const currency = transaction?.currency;
            const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
            const participant = participants?.at(0);

            if (!participant || !transaction?.amount || !currency) {
                return;
            }

            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                setIsConfirmed(true);
                IOU.sendMoneyElsewhere(report, transaction.amount, currency, trimmedComment, currentUserPersonalDetails.accountID, participant);
                return;
            }

            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                setIsConfirmed(true);
                IOU.sendMoneyWithWallet(report, transaction.amount, currency, trimmedComment, currentUserPersonalDetails.accountID, participant);
            }
        },
        [transaction?.amount, transaction?.comment, transaction?.currency, participants, currentUserPersonalDetails.accountID, report],
    );

    const setBillable = useCallback(
        (billable: boolean) => {
            IOU.setMoneyRequestBillable(transactionID, billable);
        },
        [transactionID],
    );

    // This loading indicator is shown because the transaction originalCurrency is being updated later than the component mounts.
    // To prevent the component from rendering with the wrong currency, we show a loading indicator until the correct currency is set.
    const isLoading = !!transaction?.originalCurrency;

    const onConfirm = (listOfParticipants: Participant[]) => {
        setSelectedParticipantList(listOfParticipants);

        if (gpsRequired) {
            const shouldStartLocationPermissionFlow =
                !lastLocationPermissionPrompt ||
                (DateUtils.isValidDateString(lastLocationPermissionPrompt ?? '') &&
                    DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? '')) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS);

            if (shouldStartLocationPermissionFlow) {
                setStartLocationPermissionFlow(true);
                return;
            }
        }

        createTransaction(listOfParticipants);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={IOURequestStepConfirmation.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        onBackButtonPress={navigateBack}
                        shouldShowThreeDotsButton={
                            requestType === CONST.IOU.REQUEST_TYPE.MANUAL && (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK) && !isMovingTransactionFromTrackExpense
                        }
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                        threeDotsMenuItems={[
                            {
                                icon: Expensicons.Receipt,
                                text: translate('receipt.addReceipt'),
                                onSelected: navigateToAddReceipt,
                            },
                        ]}
                    />
                    {isLoading && <FullScreenLoadingIndicator />}
                    {gpsRequired && (
                        <LocationPermissionModal
                            startPermissionFlow={startLocationPermissionFlow}
                            resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
                            onGrant={() => createTransaction(selectedParticipantList, true)}
                            onDeny={() => {
                                IOU.updateLastLocationPermissionPrompt();
                                createTransaction(selectedParticipantList, false);
                            }}
                        />
                    )}
                    <MoneyRequestConfirmationList
                        transaction={transaction}
                        selectedParticipants={participants}
                        iouAmount={Math.abs(transaction?.amount ?? 0)}
                        iouComment={transaction?.comment?.comment ?? ''}
                        iouCurrencyCode={transaction?.currency}
                        iouIsBillable={transaction?.billable}
                        onToggleBillable={setBillable}
                        iouCategory={transaction?.category}
                        onConfirm={onConfirm}
                        onSendMoney={sendMoney}
                        receiptPath={receiptPath}
                        receiptFilename={receiptFilename}
                        iouType={iouType}
                        reportID={reportID}
                        isPolicyExpenseChat={isPolicyExpenseChat}
                        policyID={IOU.getIOURequestPolicyID(transaction, report)}
                        bankAccountRoute={ReportUtils.getBankAccountRoute(report)}
                        iouMerchant={transaction?.merchant}
                        iouCreated={transaction?.created}
                        isDistanceRequest={isDistanceRequest}
                        shouldShowSmartScanFields={isMovingTransactionFromTrackExpense ? transaction?.amount !== 0 : requestType !== CONST.IOU.REQUEST_TYPE.SCAN}
                        action={action}
                        payeePersonalDetails={payeePersonalDetails}
                        shouldPlaySound={false}
                        isConfirmed={isConfirmed}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

IOURequestStepConfirmation.displayName = 'IOURequestStepConfirmation';

/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepConfirmationWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepConfirmation);
/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepConfirmationWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepConfirmationWithFullTransactionOrNotFound);
export default IOURequestStepConfirmationWithWritableReportOrNotFound;
