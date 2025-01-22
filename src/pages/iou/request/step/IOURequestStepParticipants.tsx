import {useIsFocused} from '@react-navigation/core';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormHelpMessage from '@components/FormHelpMessage';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {READ_COMMANDS} from '@libs/API/types';
import {isMobileSafari as isMobileSafariUtil} from '@libs/Browser';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getPlatform from '@libs/getPlatform';
import HttpUtils from '@libs/HttpUtils';
import {isMovingTransactionFromTrackExpense, navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {createDraftWorkspaceAndNavigateToConfirmationScreen, findSelfDMReportID, isInvoiceRoomWithID} from '@libs/ReportUtils';
import {getRequestType} from '@libs/TransactionUtils';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';
import {
    navigateToStartStepIfScanFileCannotBeRead,
    resetDraftTransactionsCustomUnit,
    setCustomUnitRateID,
    setMoneyRequestCategory,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestTag,
    setSplitShares,
} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import KeyboardUtils from '@src/utils/keyboard';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepParticipantsProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS>;

function IOURequestStepParticipants({
    route: {
        params: {iouType, reportID, transactionID, action},
    },
    transaction,
}: IOURequestStepParticipantsProps) {
    const participants = transaction?.participants;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID ?? CONST.DEFAULT_NUMBER_ID}`);

    // We need to set selectedReportID if user has navigated back from confirmation page and navigates to confirmation page with already selected participant
    const selectedReportID = useRef<string>(participants?.length === 1 ? participants.at(0)?.reportID ?? reportID : reportID);
    const numberOfParticipants = useRef(participants?.length ?? 0);
    const iouRequestType = getRequestType(transaction);
    const isSplitRequest = iouType === CONST.IOU.TYPE.SPLIT;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const headerTitle = useMemo(() => {
        if (action === CONST.IOU.ACTION.CATEGORIZE) {
            return translate('iou.categorize');
        }
        if (action === CONST.IOU.ACTION.SHARE) {
            return translate('iou.share');
        }
        if (isSplitRequest) {
            return translate('iou.splitExpense');
        }
        if (iouType === CONST.IOU.TYPE.PAY) {
            return translate('iou.paySomeone', {});
        }
        if (iouType === CONST.IOU.TYPE.INVOICE) {
            return translate('workspace.invoices.sendInvoice');
        }
        return translate('iou.chooseRecipient');
    }, [iouType, translate, isSplitRequest, action]);

    const selfDMReportID = useMemo(() => findSelfDMReportID(), []);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`);

    const receiptFilename = transaction?.filename;
    const receiptPath = transaction?.receipt?.source;
    const receiptType = transaction?.receipt?.type;
    const isAndroidNative = getPlatform() === CONST.PLATFORM.ANDROID;
    const isMobileSafari = isMobileSafariUtil();

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the expense is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the expense process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    useEffect(() => {
        if (isMovingTransactionFromTrackExpense) {
            return;
        }
        navigateToStartStepIfScanFileCannotBeRead(receiptFilename ?? '', receiptPath ?? '', () => {}, iouRequestType, iouType, transactionID, reportID, receiptType ?? '');
    }, [receiptType, receiptPath, receiptFilename, iouRequestType, iouType, transactionID, reportID, isMovingTransactionFromTrackExpense]);

    // When the step opens, reset the custom unit of the draft transaction if it's moving from Track Expense.
    // This is needed to revert the rate back to the original FAKE_P2P_RATE_ID when changing the destination workspace.
    useEffect(() => {
        if (!isMovingTransactionFromTrackExpense) {
            return;
        }

        resetDraftTransactionsCustomUnit(transactionID);
    }, [isFocused, isMovingTransactionFromTrackExpense, transactionID]);

    const trackExpense = useCallback(() => {
        // If coming from the combined submit/track flow and the user proceeds to just track the expense,
        // we will use the track IOU type in the confirmation flow.
        if (!selfDMReportID) {
            return;
        }

        const rateID = DistanceRequestUtils.getCustomUnitRateID(selfDMReportID);
        setCustomUnitRateID(transactionID, rateID);
        setMoneyRequestParticipantsFromReport(transactionID, selfDMReport);
        const iouConfirmationPageRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, CONST.IOU.TYPE.TRACK, transactionID, selfDMReportID);
        Navigation.navigate(iouConfirmationPageRoute);
    }, [action, selfDMReport, selfDMReportID, transactionID]);

    const addParticipant = useCallback(
        (val: Participant[]) => {
            HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);

            const firstParticipant = val.at(0);

            if (firstParticipant?.isSelfDM) {
                trackExpense();
                return;
            }

            const firstParticipantReportID = val.at(0)?.reportID;
            const isInvoice = iouType === CONST.IOU.TYPE.INVOICE && isInvoiceRoomWithID(firstParticipantReportID);
            numberOfParticipants.current = val.length;
            setMoneyRequestParticipants(transactionID, val);

            if (!isMovingTransactionFromTrackExpense) {
                // When moving the transaction, keep the original rate and let the user manually change it to the one they want from the workspace.
                // Otherwise, select the default one automatically.
                const rateID = DistanceRequestUtils.getCustomUnitRateID(firstParticipantReportID);
                setCustomUnitRateID(transactionID, rateID);
            }

            // When multiple participants are selected, the reportID is generated at the end of the confirmation step.
            // So we are resetting selectedReportID ref to the reportID coming from params.
            if (val.length !== 1 && !isInvoice) {
                selectedReportID.current = reportID;
                return;
            }

            // When a participant is selected, the reportID needs to be saved because that's the reportID that will be used in the confirmation step.
            selectedReportID.current = firstParticipantReportID ?? reportID;
        },
        [iouType, reportID, trackExpense, transactionID, isMovingTransactionFromTrackExpense],
    );

    const handleNavigation = useCallback(
        (route: Route) => {
            if (isAndroidNative || isMobileSafari) {
                KeyboardUtils.dismiss().then(() => {
                    Navigation.navigate(route);
                });
            } else {
                Navigation.navigate(route);
            }
        },
        [isAndroidNative, isMobileSafari],
    );

    const goToNextStep = useCallback(() => {
        const isCategorizing = action === CONST.IOU.ACTION.CATEGORIZE;
        const isShareAction = action === CONST.IOU.ACTION.SHARE;

        const isPolicyExpenseChat = participants?.some((participant) => participant.isPolicyExpenseChat);
        if (iouType === CONST.IOU.TYPE.SPLIT && !isPolicyExpenseChat && transaction?.amount && transaction?.currency) {
            const participantAccountIDs = participants?.map((participant) => participant.accountID) as number[];
            setSplitShares(transaction, transaction.amount, transaction.currency, participantAccountIDs);
        }

        setMoneyRequestTag(transactionID, '');
        setMoneyRequestCategory(transactionID, '');
        if ((isCategorizing || isShareAction) && numberOfParticipants.current === 0) {
            createDraftWorkspaceAndNavigateToConfirmationScreen(transactionID, action);
            return;
        }

        // If coming from the combined submit/track flow and the user proceeds to submit the expense
        // we will use the submit IOU type in the confirmation flow.
        const iouConfirmationPageRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
            action,
            iouType === CONST.IOU.TYPE.CREATE ? CONST.IOU.TYPE.SUBMIT : iouType,
            transactionID,
            selectedReportID.current || reportID,
        );

        const route = isCategorizing
            ? ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, selectedReportID.current || reportID, iouConfirmationPageRoute)
            : iouConfirmationPageRoute;

        handleNavigation(route);
    }, [action, participants, iouType, transaction, transactionID, reportID, handleNavigation]);

    const navigateBack = useCallback(() => {
        navigateToStartMoneyRequestStep(iouRequestType, iouType, transactionID, reportID, action);
    }, [iouRequestType, iouType, transactionID, reportID, action]);

    const trackExpense = () => {
        // If coming from the combined submit/track flow and the user proceeds to just track the expense,
        // we will use the track IOU type in the confirmation flow.
        if (!selfDMReportID) {
            return;
        }

        const rateID = DistanceRequestUtils.getCustomUnitRateID(selfDMReportID);
        setCustomUnitRateID(transactionID, rateID);
        setMoneyRequestParticipantsFromReport(transactionID, selfDMReport);
        const iouConfirmationPageRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, CONST.IOU.TYPE.TRACK, transactionID, selfDMReportID);

        handleNavigation(iouConfirmationPageRoute);
    };

    useEffect(() => {
        const isCategorizing = action === CONST.IOU.ACTION.CATEGORIZE;
        const isShareAction = action === CONST.IOU.ACTION.SHARE;
        if (isFocused && (isCategorizing || isShareAction)) {
            setMoneyRequestParticipants(transactionID, []);
            numberOfParticipants.current = 0;
        }
    }, [isFocused, action, transactionID]);

    return (
        <StepScreenWrapper
            headerTitle={headerTitle}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepParticipants.displayName}
        >
            {!!skipConfirmation && (
                <FormHelpMessage
                    style={[styles.ph4, styles.mb4]}
                    isError={false}
                    shouldShowRedDotIndicator={false}
                    message={translate('quickAction.noLongerHaveReportAccess')}
                />
            )}
            <MoneyRequestParticipantsSelector
                participants={isSplitRequest ? participants : []}
                onParticipantsAdded={addParticipant}
                onFinish={goToNextStep}
                iouType={iouType}
                action={action}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepParticipants.displayName = 'IOURequestStepParticipants';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepParticipants));
