import FormHelpMessage from '@components/FormHelpMessage';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParticipantSubmission from '@hooks/useParticipantSubmission';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {getIsWorkspacesOnlyForTransaction, isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils, navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {endSpan} from '@libs/telemetry/activeSpans';
import {getRequestType, isFromCreditCardImport, isPerDiemRequest, isTimeRequest as isTimeRequestUtil} from '@libs/TransactionUtils';

import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';

import {navigateToStartStepIfScanFileCannotBeRead} from '@userActions/IOU/Receipt';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import {useIsFocused} from '@react-navigation/core';
import React, {useEffect, useRef} from 'react';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepParticipantsProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS>;

function IOURequestStepParticipants({
    route: {
        params: {iouType, reportID, transactionID: initialTransactionID, action, backTo, isWorkspacesOnly: isWorkspacesOnlyParam, isSubmitWorkspacesOnly: isSubmitWorkspacesOnlyParam},
    },
    transaction: initialTransaction,
}: IOURequestStepParticipantsProps) {
    // "Submit to my employer" with multiple submit-enabled workspaces passes isWorkspacesOnly=true to limit the picker to workspaces.
    const isWorkspacesOnlyFromRoute = isWorkspacesOnlyParam === 'true';
    // ...and isSubmitWorkspacesOnly=true to further restrict the picker to Submit (submit2026) workspaces only.
    const isSubmitWorkspacesOnly = isSubmitWorkspacesOnlyParam === 'true';
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
    const isTransactionFromCreditCardImport = isFromCreditCardImport(initialTransaction);
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);

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
    // This is because until the expense is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the expense process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
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

    // In new flow - the amount step is skipped, so we need to include the recents for all the cases.
    // Submit-only implies workspaces-only (we still hide individuals/recents in the Submit-to-employer picker).
    const isWorkspacesOnly =
        isWorkspacesOnlyFromRoute || isSubmitWorkspacesOnly || (isNewManualExpenseFlowEnabled ? false : getIsWorkspacesOnlyForTransaction(initialTransaction, iouRequestType));
    const selectedParticipant = isSplitRequest ? undefined : participants?.find((participant) => participant.selected && !participant.isSender);
    // Participants with a reportID are found in the list and highlighted via initiallySelectedReportID.
    // Those without one (e.g. users to invite who don't have an account yet) must be passed explicitly
    // so formatSectionsFromSearchTerm can render them in the selected section.
    const selectedParticipantsWithoutReport = selectedParticipant && !selectedParticipant.reportID ? [selectedParticipant] : CONST.EMPTY_ARRAY;

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
                participants={isSplitRequest ? participants : selectedParticipantsWithoutReport}
                onParticipantsAdded={addParticipant}
                onFinish={goToNextStep}
                iouType={iouType}
                action={action}
                isPerDiemRequest={isPerDiem}
                isTimeRequest={isTime}
                isWorkspacesOnly={isWorkspacesOnly}
                isSubmitWorkspacesOnly={isSubmitWorkspacesOnly}
                isTransactionFromCreditCardImport={isTransactionFromCreditCardImport}
                shouldExcludeP2P={(initialTransaction?.amount ?? 0) < 0}
                initiallySelectedReportID={selectedParticipant?.reportID}
                shouldMoveSelectedToTop
            />
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepParticipants));
