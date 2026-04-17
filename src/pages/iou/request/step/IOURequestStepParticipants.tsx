import {useIsFocused} from '@react-navigation/core';
import React, {useEffect, useRef} from 'react';
import FormHelpMessage from '@components/FormHelpMessage';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParticipantSubmission from '@hooks/useParticipantSubmission';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils, navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {endSpan} from '@libs/telemetry/activeSpans';
import {getRequestType, hasRoute, isCorporateCardTransaction, isDistanceRequest, isPerDiemRequest, isTimeRequest as isTimeRequestUtil} from '@libs/TransactionUtils';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';
import {navigateToStartStepIfScanFileCannotBeRead} from '@userActions/IOU/Receipt';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepParticipantsProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS>;

function IOURequestStepParticipants({
    route: {
        params: {iouType, reportID, transactionID: initialTransactionID, action, backTo},
    },
    transaction: initialTransaction,
}: IOURequestStepParticipantsProps) {
    const participants = initialTransaction?.participants;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`);

    const iouRequestType = getRequestType(initialTransaction);
    const isSplitRequest = iouType === CONST.IOU.TYPE.SPLIT;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const isPerDiem = isPerDiemRequest(initialTransaction);
    const isTime = isTimeRequestUtil(initialTransaction);
    const isCorporateCard = isCorporateCardTransaction(initialTransaction);

    let headerTitle = translate('iou.chooseRecipient');
    if (action === CONST.IOU.ACTION.CATEGORIZE) {
        headerTitle = translate('iou.categorize');
    } else if (action === CONST.IOU.ACTION.SHARE) {
        headerTitle = translate('iou.share');
    } else if (isSplitRequest) {
        headerTitle = translate('iou.splitExpense');
    } else if (iouType === CONST.IOU.TYPE.PAY) {
        headerTitle = translate('iou.paySomeone');
    } else if (iouType === CONST.IOU.TYPE.INVOICE) {
        headerTitle = translate('workspace.invoices.sendInvoice');
    }

    const {addParticipant, goToNextStep} = useParticipantSubmission({
        reportID,
        initialTransactionID,
        initialTransaction,
        participants,
        iouType,
        action,
        backTo,
        isSplitRequest,
        isMovingTransactionFromTrackExpense,
        isFocused,
    });

    const hasEndedSpan = useRef(false);
    useEffect(() => {
        if (hasEndedSpan.current) {
            return;
        }
        hasEndedSpan.current = true;
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
    }, []);

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    useEffect(() => {
        if (isMovingTransactionFromTrackExpense) {
            return;
        }
        const firstReceiptFilename = initialTransaction?.receipt?.filename ?? '';
        const firstReceiptPath = initialTransaction?.receipt?.source ?? '';
        const firstReceiptType = initialTransaction?.receipt?.type ?? '';
        navigateToStartStepIfScanFileCannotBeRead(firstReceiptFilename, firstReceiptPath, () => {}, iouRequestType, iouType, initialTransactionID, reportID, firstReceiptType);
    }, [
        iouRequestType,
        iouType,
        initialTransaction?.receipt?.filename,
        initialTransaction?.receipt?.source,
        initialTransaction?.receipt?.type,
        initialTransactionID,
        reportID,
        isMovingTransactionFromTrackExpense,
    ]);

    const navigateBack = () => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        const shouldForceIOUType =
            action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.SUBMIT && (iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL || iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN);
        const iouTypeValue = shouldForceIOUType ? CONST.IOU.TYPE.CREATE : iouType;

        navigateToStartMoneyRequestStep(iouRequestType, iouTypeValue, initialTransactionID, reportID, action);
    };

    const getIsWorkspacesOnly = () => {
        if (isDistanceRequest(initialTransaction)) {
            if (!hasRoute(initialTransaction, true)) {
                return false;
            }
            return initialTransaction?.comment?.customUnit?.quantity === 0;
        }

        if (iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN) {
            return false;
        }

        return initialTransaction?.amount !== undefined && initialTransaction?.amount !== null && initialTransaction?.amount <= 0;
    };
    const isWorkspacesOnly = getIsWorkspacesOnly();

    return (
        <StepScreenWrapper
            headerTitle={headerTitle}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepParticipants"
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
                participants={isSplitRequest ? participants : getEmptyArray()}
                onParticipantsAdded={addParticipant}
                onFinish={goToNextStep}
                iouType={iouType}
                action={action}
                isPerDiemRequest={isPerDiem}
                isTimeRequest={isTime}
                isWorkspacesOnly={isWorkspacesOnly}
                isCorporateCardTransaction={isCorporateCard}
            />
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepParticipants));
