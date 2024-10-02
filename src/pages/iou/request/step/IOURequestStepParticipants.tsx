import {useIsFocused} from '@react-navigation/core';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormHelpMessage from '@components/FormHelpMessage';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {READ_COMMANDS} from '@libs/API/types';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import HttpUtils from '@libs/HttpUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepParticipantsOnyxProps = {
    /** Whether the confirmation step should be skipped */
    skipConfirmation: OnyxEntry<boolean>;
};

type IOURequestStepParticipantsProps = IOURequestStepParticipantsOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS>;

function IOURequestStepParticipants({
    route: {
        params: {iouType, reportID, transactionID, action},
    },
    transaction,
    skipConfirmation,
}: IOURequestStepParticipantsProps) {
    const participants = transaction?.participants;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const {canUseP2PDistanceRequests} = usePermissions(iouType);

    // We need to set selectedReportID if user has navigated back from confirmation page and navigates to confirmation page with already selected participant
    const selectedReportID = useRef<string>(participants?.length === 1 ? participants.at(0)?.reportID ?? reportID : reportID);
    const numberOfParticipants = useRef(participants?.length ?? 0);
    const iouRequestType = TransactionUtils.getRequestType(transaction);
    const isSplitRequest = iouType === CONST.IOU.TYPE.SPLIT;
    const headerTitle = useMemo(() => {
        if (action === CONST.IOU.ACTION.CATEGORIZE) {
            return translate('iou.categorize');
        }
        if (action === CONST.IOU.ACTION.SUBMIT) {
            return translate('iou.submitExpense');
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
        return translate('iou.submitExpense');
    }, [iouType, translate, isSplitRequest, action]);

    const selfDMReportID = useMemo(() => ReportUtils.findSelfDMReportID(), []);
    const shouldDisplayTrackExpenseButton = !!selfDMReportID && action === CONST.IOU.ACTION.CREATE;

    const receiptFilename = transaction?.filename;
    const receiptPath = transaction?.receipt?.source;
    const receiptType = transaction?.receipt?.type;

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the expense is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the expense process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    useEffect(() => {
        if (IOUUtils.isMovingTransactionFromTrackExpense(action)) {
            return;
        }
        IOU.navigateToStartStepIfScanFileCannotBeRead(receiptFilename ?? '', receiptPath ?? '', () => {}, iouRequestType, iouType, transactionID, reportID, receiptType ?? '');
    }, [receiptType, receiptPath, receiptFilename, iouRequestType, iouType, transactionID, reportID, action]);

    const addParticipant = useCallback(
        (val: Participant[]) => {
            HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);

            const firstParticipantReportID = val.at(0)?.reportID ?? '';
            const rateID = DistanceRequestUtils.getCustomUnitRateID(firstParticipantReportID, !canUseP2PDistanceRequests);
            const isInvoice = iouType === CONST.IOU.TYPE.INVOICE && ReportUtils.isInvoiceRoomWithID(firstParticipantReportID);
            numberOfParticipants.current = val.length;

            IOU.setMoneyRequestParticipants(transactionID, val);
            IOU.setCustomUnitRateID(transactionID, rateID);

            // When multiple participants are selected, the reportID is generated at the end of the confirmation step.
            // So we are resetting selectedReportID ref to the reportID coming from params.
            if (val.length !== 1 && !isInvoice) {
                selectedReportID.current = reportID;
                return;
            }

            // When a participant is selected, the reportID needs to be saved because that's the reportID that will be used in the confirmation step.
            selectedReportID.current = firstParticipantReportID || reportID;
        },
        [iouType, reportID, transactionID, canUseP2PDistanceRequests],
    );

    const goToNextStep = useCallback(() => {
        const isCategorizing = action === CONST.IOU.ACTION.CATEGORIZE;
        const isShareAction = action === CONST.IOU.ACTION.SHARE;

        const isPolicyExpenseChat = participants?.some((participant) => participant.isPolicyExpenseChat);
        if (iouType === CONST.IOU.TYPE.SPLIT && !isPolicyExpenseChat && transaction?.amount && transaction?.currency) {
            const participantAccountIDs = participants?.map((participant) => participant.accountID) as number[];
            IOU.setSplitShares(transaction, transaction.amount, transaction.currency, participantAccountIDs);
        }

        IOU.setMoneyRequestTag(transactionID, '');
        IOU.setMoneyRequestCategory(transactionID, '');
        if ((isCategorizing || isShareAction) && numberOfParticipants.current === 0) {
            ReportUtils.createDraftWorkspaceAndNavigateToConfirmationScreen(transactionID, action);
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
        if (isCategorizing) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, selectedReportID.current || reportID, iouConfirmationPageRoute));
        } else {
            Navigation.navigate(iouConfirmationPageRoute);
        }
    }, [iouType, transactionID, transaction, reportID, action, participants]);

    const navigateBack = useCallback(() => {
        IOUUtils.navigateToStartMoneyRequestStep(iouRequestType, iouType, transactionID, reportID, action);
    }, [iouRequestType, iouType, transactionID, reportID, action]);

    const trackExpense = () => {
        // If coming from the combined submit/track flow and the user proceeds to just track the expense,
        // we will use the track IOU type in the confirmation flow.
        if (!selfDMReportID) {
            return;
        }

        IOU.setMoneyRequestParticipantsFromReport(transactionID, ReportUtils.getReport(selfDMReportID));
        const iouConfirmationPageRoute = ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, CONST.IOU.TYPE.TRACK, transactionID, selfDMReportID);
        Navigation.navigate(iouConfirmationPageRoute);
    };

    useEffect(() => {
        const isCategorizing = action === CONST.IOU.ACTION.CATEGORIZE;
        const isShareAction = action === CONST.IOU.ACTION.SHARE;
        if (isFocused && (isCategorizing || isShareAction)) {
            IOU.setMoneyRequestParticipants(transactionID, []);
            numberOfParticipants.current = 0;
        }
    }, [isFocused, action, transactionID]);

    return (
        <StepScreenWrapper
            headerTitle={headerTitle}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepParticipants.displayName}
            includeSafeAreaPaddingBottom={false}
        >
            {skipConfirmation && (
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
                onTrackExpensePress={trackExpense}
                iouType={iouType}
                iouRequestType={iouRequestType}
                action={action}
                shouldDisplayTrackExpenseButton={shouldDisplayTrackExpenseButton}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepParticipants.displayName = 'IOURequestStepParticipants';

const IOURequestStepParticipantsWithOnyx = withOnyx<IOURequestStepParticipantsProps, IOURequestStepParticipantsOnyxProps>({
    skipConfirmation: {
        key: ({route}) => {
            const transactionID = route.params.transactionID ?? -1;
            return `${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`;
        },
    },
})(IOURequestStepParticipants);

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepParticipantsWithOnyx));
