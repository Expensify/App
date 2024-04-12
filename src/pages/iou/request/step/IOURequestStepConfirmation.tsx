import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MoneyRequestConfirmationList from '@components/MoneyTemporaryForRefactorRequestConfirmationList';
import {usePersonalDetails} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {openDraftWorkspaceRequest} from '@libs/actions/Policy';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getCurrentPosition from '@libs/getCurrentPosition';
import * as IOUUtils from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy, PolicyCategories, PolicyTagList} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type IOURequestStepConfirmationOnyxProps = {
    /** The policy of the report */
    policy: OnyxEntry<Policy>;

    /** The category configuration of the report's policy */
    policyCategories: OnyxEntry<PolicyCategories>;

    /** The tag configuration of the report's policy */
    policyTags: OnyxEntry<PolicyTagList>;
};

type IOURequestStepConfirmationProps = IOURequestStepConfirmationOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION>;

function IOURequestStepConfirmation({
    policy,
    policyTags,
    policyCategories,
    report,
    route: {
        params: {iouType, reportID, transactionID},
    },
    transaction,
}: IOURequestStepConfirmationProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();
    const [receiptFile, setReceiptFile] = useState<Receipt>();

    const receiptFilename = transaction?.filename;
    const receiptPath = transaction?.receipt?.source;
    const receiptType = transaction?.receipt?.type;
    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault;
    const transactionTaxCode = transaction?.taxRate ? transaction.taxRate.data?.code : foreignTaxDefault;
    const transactionTaxAmount = transaction?.taxAmount;

    const requestType = TransactionUtils.getRequestType(transaction);

    const headerTitle = useMemo(() => {
        if (iouType === CONST.IOU.TYPE.SPLIT) {
            return translate('iou.split');
        }
        if (iouType === CONST.IOU.TYPE.TRACK_EXPENSE) {
            return translate('iou.trackExpense');
        }
        if (iouType === CONST.IOU.TYPE.SEND) {
            return translate('common.send');
        }
        return translate(TransactionUtils.getHeaderTitleTranslationKey(transaction));
    }, [iouType, transaction, translate]);

    const participants = useMemo(
        () =>
            transaction?.participants?.map((participant) => {
                const participantAccountID = participant.accountID ?? 0;
                return participantAccountID ? OptionsListUtils.getParticipantsOption(participant, personalDetails) : OptionsListUtils.getReportOption(participant);
            }) ?? [],
        [transaction?.participants, personalDetails],
    );
    const isPolicyExpenseChat = useMemo(() => ReportUtils.isPolicyExpenseChat(ReportUtils.getRootParentReport(report)), [report]);
    const formHasBeenSubmitted = useRef(false);

    useEffect(() => {
        if (!transaction?.originalCurrency) {
            return;
        }
        // If user somehow lands on this page without the currency reset, then reset it here.
        IOU.setMoneyRequestCurrency_temporaryForRefactor(transactionID, transaction.originalCurrency, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const policyExpenseChat = participants?.find((participant) => participant.isPolicyExpenseChat);
        if (policyExpenseChat?.policyID) {
            openDraftWorkspaceRequest(policyExpenseChat.policyID);
        }
    }, [isOffline, participants, transaction?.billable, policy, transactionID]);

    const defaultBillable = !!policy?.defaultBillable;
    useEffect(() => {
        IOU.setMoneyRequestBillable_temporaryForRefactor(transactionID, defaultBillable);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionID, requestType, defaultCategory]);

    const navigateBack = useCallback(() => {
        // If there is not a report attached to the IOU with a reportID, then the participants were manually selected and the user needs taken
        // back to the participants step
        if (!transaction?.participantsAutoAssigned) {
            Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
            return;
        }
        IOUUtils.navigateToStartMoneyRequestStep(requestType, iouType, transactionID, reportID);
    }, [transaction, iouType, requestType, transactionID, reportID]);

    const navigateToAddReceipt = useCallback(() => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
    }, [iouType, transactionID, reportID]);

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    useEffect(() => {
        const onSuccess = (file: File) => {
            const receipt: Receipt = file;
            receipt.state = file && requestType === CONST.IOU.REQUEST_TYPE.MANUAL ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCANREADY;
            setReceiptFile(receipt);
        };

        IOU.navigateToStartStepIfScanFileCannotBeRead(receiptFilename, receiptPath, onSuccess, requestType, iouType, transactionID, reportID, receiptType);
    }, [receiptType, receiptPath, receiptFilename, requestType, iouType, transactionID, reportID]);

    const requestMoney = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string, receiptObj?: Receipt, gpsPoints?: IOU.GpsPoint) => {
            if (!transaction) {
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
                selectedParticipants[0],
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
            );
        },
        [report, transaction, transactionTaxCode, transactionTaxAmount, currentUserPersonalDetails.login, currentUserPersonalDetails.accountID, policy, policyTags, policyCategories],
    );

    const trackExpense = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string, receiptObj?: Receipt, gpsPoints?: IOU.GpsPoint) => {
            if (!report || !transaction) {
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
                selectedParticipants[0],
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
                Object.keys(transaction?.comment?.waypoints ?? {}).length ? TransactionUtils.getValidWaypoints(transaction.comment.waypoints, true) : undefined,
            );
        },
        [report, transaction, currentUserPersonalDetails.login, currentUserPersonalDetails.accountID, transactionTaxCode, transactionTaxAmount, policy, policyTags, policyCategories],
    );

    const createDistanceRequest = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string) => {
            if (!transaction) {
                return;
            }
            IOU.createDistanceRequest(
                report,
                selectedParticipants[0],
                trimmedComment,
                transaction.created,
                transaction.category,
                transaction.tag,
                transaction.amount,
                transaction.currency,
                transaction.merchant,
                transaction.billable,
                TransactionUtils.getValidWaypoints(transaction.comment.waypoints, true),
                policy,
                policyTags,
                policyCategories,
            );
        },
        [policy, policyCategories, policyTags, report, transaction],
    );

    const createTransaction = useCallback(
        (selectedParticipants: Participant[]) => {
            const trimmedComment = (transaction?.comment.comment ?? '').trim();

            // Don't let the form be submitted multiple times while the navigator is waiting to take the user to a different page
            if (formHasBeenSubmitted.current) {
                return;
            }

            formHasBeenSubmitted.current = true;

            // If we have a receipt let's start the split bill by creating only the action, the transaction, and the group DM if needed
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
                    });
                }
                return;
            }

            // IOUs created from a group report will have a reportID param in the route.
            // Since the user is already viewing the report, we don't need to navigate them to the report
            if (iouType === CONST.IOU.TYPE.SPLIT && !transaction?.isFromGlobalCreate) {
                if (currentUserPersonalDetails.login && !!transaction) {
                    IOU.splitBill({
                        participants: selectedParticipants,
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
                    });
                }
                return;
            }

            // If the request is created from the global create menu, we also navigate the user to the group report
            if (iouType === CONST.IOU.TYPE.SPLIT) {
                if (currentUserPersonalDetails.login && !!transaction) {
                    IOU.splitBillAndOpenReport({
                        participants: selectedParticipants,
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
                    });
                }
                return;
            }

            if (iouType === CONST.IOU.TYPE.TRACK_EXPENSE) {
                if (receiptFile && transaction) {
                    // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                    if (transaction.amount === 0) {
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
                                // It's OK to get a cached location that is up to an hour old because the only accuracy needed is the country the user is in
                                maximumAge: 1000 * 60 * 60,

                                // 15 seconds, don't wait too long because the server can always fall back to using the IP address
                                timeout: 15000,
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
                if (transaction.amount === 0) {
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
                            // It's OK to get a cached location that is up to an hour old because the only accuracy needed is the country the user is in
                            maximumAge: 1000 * 60 * 60,

                            // 15 seconds, don't wait too long because the server can always fall back to using the IP address
                            timeout: 15000,
                        },
                    );
                    return;
                }

                // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                requestMoney(selectedParticipants, trimmedComment, receiptFile);
                return;
            }

            if (requestType === CONST.IOU.REQUEST_TYPE.DISTANCE) {
                createDistanceRequest(selectedParticipants, trimmedComment);
                return;
            }

            requestMoney(selectedParticipants, trimmedComment);
        },
        [
            transaction,
            iouType,
            receiptFile,
            requestType,
            requestMoney,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            report?.reportID,
            trackExpense,
            createDistanceRequest,
        ],
    );

    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     */
    const sendMoney = useCallback(
        (paymentMethod: PaymentMethodType | undefined) => {
            const currency = transaction?.currency;

            const trimmedComment = transaction?.comment?.comment ? transaction.comment.comment.trim() : '';

            const participant = participants?.[0];

            if (!participant || !transaction?.amount || !currency) {
                return;
            }

            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                IOU.sendMoneyElsewhere(report, transaction.amount, currency, trimmedComment, currentUserPersonalDetails.accountID, participant);
                return;
            }

            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                IOU.sendMoneyWithWallet(report, transaction.amount, currency, trimmedComment, currentUserPersonalDetails.accountID, participant);
            }
        },
        [transaction?.amount, transaction?.comment, transaction?.currency, participants, currentUserPersonalDetails.accountID, report],
    );

    const addNewParticipant = (option: Participant) => {
        const newParticipants = transaction?.participants?.map((participant) => {
            if (participant.accountID === option.accountID) {
                return {...participant, selected: !participant.selected};
            }
            return participant;
        });
        IOU.setMoneyRequestParticipants_temporaryForRefactor(transactionID, newParticipants);
    };

    const setBillable = (billable: boolean) => {
        IOU.setMoneyRequestBillable_temporaryForRefactor(transactionID, billable);
    };

    // This loading indicator is shown because the transaction originalCurrency is being updated later than the component mounts.
    // To prevent the component from rendering with the wrong currency, we show a loading indicator until the correct currency is set.
    const isLoading = !!transaction?.originalCurrency;

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
                        shouldShowThreeDotsButton={requestType === CONST.IOU.REQUEST_TYPE.MANUAL && (iouType === CONST.IOU.TYPE.REQUEST || iouType === CONST.IOU.TYPE.TRACK_EXPENSE)}
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
                    <View style={[styles.flex1, isLoading && styles.opacity0]}>
                        <MoneyRequestConfirmationList
                            transaction={transaction}
                            hasMultipleParticipants={iouType === CONST.IOU.TYPE.SPLIT}
                            selectedParticipants={participants}
                            iouAmount={transaction?.amount ?? 0}
                            iouComment={transaction?.comment.comment ?? ''}
                            iouCurrencyCode={transaction?.currency}
                            iouIsBillable={transaction?.billable}
                            onToggleBillable={setBillable}
                            iouCategory={transaction?.category}
                            onConfirm={createTransaction}
                            onSendMoney={sendMoney}
                            onSelectParticipant={addNewParticipant}
                            receiptPath={receiptPath}
                            receiptFilename={receiptFilename}
                            iouType={iouType}
                            reportID={reportID}
                            isPolicyExpenseChat={isPolicyExpenseChat}
                            // The participants can only be modified when the action is initiated from directly within a group chat and not the floating-action-button.
                            // This is because when there is a group of people, say they are on a trip, and you have some shared expenses with some of the people,
                            // but not all of them (maybe someone skipped out on dinner). Then it's nice to be able to select/deselect people from the group chat bill
                            // split rather than forcing the user to create a new group, just for that expense. The reportID is empty, when the action was initiated from
                            // the floating-action-button (since it is something that exists outside the context of a report).
                            canModifyParticipants={!transaction?.isFromGlobalCreate}
                            policyID={report?.policyID}
                            bankAccountRoute={ReportUtils.getBankAccountRoute(report)}
                            iouMerchant={transaction?.merchant}
                            iouCreated={transaction?.created}
                            isDistanceRequest={requestType === CONST.IOU.REQUEST_TYPE.DISTANCE}
                            shouldShowSmartScanFields={requestType !== CONST.IOU.REQUEST_TYPE.SCAN}
                        />
                    </View>
                </View>
            )}
        </ScreenWrapper>
    );
}

IOURequestStepConfirmation.displayName = 'IOURequestStepConfirmation';

const IOURequestStepConfirmationWithOnyx = withOnyx<IOURequestStepConfirmationProps, IOURequestStepConfirmationOnyxProps>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
    },
    policyCategories: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`,
    },
    policyTags: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
    },
})(IOURequestStepConfirmation);
/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepConfirmationWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepConfirmationWithOnyx);
/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepConfirmationWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepConfirmationWithFullTransactionOrNotFound);
export default IOURequestStepConfirmationWithWritableReportOrNotFound;
