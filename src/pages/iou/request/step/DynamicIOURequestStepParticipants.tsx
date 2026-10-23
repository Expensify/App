import FormHelpMessage from '@components/FormHelpMessage';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import useConfirmationParticipantSelection from '@hooks/useConfirmationParticipantSelection';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParticipantSubmission from '@hooks/useParticipantSubmission';
import useThemeStyles from '@hooks/useThemeStyles';

import {getIsWorkspacesOnlyForTransaction, getSelectedWorkspacePolicyID, isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import {
    getRequestType,
    isDistanceRequest,
    isFromCreditCardImport,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    isPerDiemRequest,
    isSplitChildTransaction,
    isTimeRequest as isTimeRequestUtil,
} from '@libs/TransactionUtils';

import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';

import {navigateToStartStepIfScanFileCannotBeRead} from '@userActions/IOU/Receipt';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/core';
import React, {useEffect, useRef, useState} from 'react';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepParticipantsProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_PARTICIPANTS> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_PARTICIPANTS>;

function DynamicIOURequestStepParticipants({route, navigation, transaction: initialTransaction}: DynamicIOURequestStepParticipantsProps) {
    const {
        iouType,
        reportID,
        transactionID: initialTransactionID,
        action,
        isWorkspacesOnly: isWorkspacesOnlyParam,
        shouldExcludeWorkspaces: shouldExcludeWorkspacesParam,
        isFromConfirmation: isFromConfirmationParam,
    } = route.params;
    // Opened from the confirmation's "To" row, so a pick is written to that expense and the page goes back to it.
    const isFromConfirmation = isFromConfirmationParam === 'true';
    // "Submit to my employer" with multiple submit-enabled workspaces passes isWorkspacesOnly=true to limit the picker to workspaces.
    const isWorkspacesOnlyFromRoute = isWorkspacesOnlyParam === 'true';
    // Submitting to a person offers recipients only, so the owned workspace chats are left out of the picker.
    const shouldExcludeWorkspaces = shouldExcludeWorkspacesParam === 'true';
    const participants = initialTransaction?.participants;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.path);

    const iouRequestType = getRequestType(initialTransaction);
    const isSplitRequest = iouType === CONST.IOU.TYPE.SPLIT;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const isPerDiem = isPerDiemRequest(initialTransaction);
    const isTime = isTimeRequestUtil(initialTransaction);
    const isTransactionFromCreditCardImport = isFromCreditCardImport(initialTransaction);

    let headerTitle = translate('iou.chooseRecipient');
    if (isFromConfirmation) {
        headerTitle = translate('iou.chooseRecipient');
    } else if (action === CONST.IOU.ACTION.CATEGORIZE) {
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

    // Split expenses can only be submitted to a workspace, so restrict the recipient list to workspaces.
    // The amount step is skipped, so we include recents for every other case. This step is still reachable with an amount
    // set (confirmation's back navigation returns here), but negatives are handled by `shouldExcludeP2P` below - only the
    // zero-quantity distance case of `getIsWorkspacesOnlyForTransaction` is knowingly dropped here.
    // Submit-only implies workspaces-only (we still hide individuals/recents in the Submit-to-employer picker).
    // From the confirmation the amount is already known, so the zero-quantity distance case is covered there.
    const isWorkspacesOnly = isFromConfirmation
        ? getIsWorkspacesOnlyForTransaction(initialTransaction, iouRequestType)
        : isWorkspacesOnlyFromRoute || (action === CONST.IOU.ACTION.SUBMIT && isSplitChildTransaction(initialTransaction));

    const {addParticipant, goToNextStep} = useParticipantSubmission({
        reportID,
        initialTransactionID,
        initialTransaction,
        participants,
        iouType,
        action,
        isSplitRequest,
        isMovingTransactionFromTrackExpense,
        // The step's on-focus resets belong to the multi-step flow.
        isFocused: isFocused && !isFromConfirmation,
        isWorkspacesOnly,
        shouldExcludeWorkspaces,
    });
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        isManualDistanceRequest: isManualDistanceRequest(initialTransaction),
        isOdometerDistanceRequest: isOdometerDistanceRequest(initialTransaction),
        isDistanceRequest: isDistanceRequest(initialTransaction),
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
        // The confirmation underneath checks its own receipt, so there is no step to restart from here.
        if (isMovingTransactionFromTrackExpense || isFromConfirmation) {
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
        isFromConfirmation,
    ]);

    // Params are not compared because the picker may have changed the transaction's report and participants.
    const navigateBack = () => {
        Navigation.goBack(backPath, {compareParams: false});
    };

    const confirmationIOUTypeRef = useRef<IOUType | undefined>(undefined);
    const hasReturnedToConfirmationRef = useRef(false);
    const {handleParticipantsAdded: addParticipantToConfirmation} = useConfirmationParticipantSelection({
        transaction: initialTransaction,
        iouType,
        reportID,
        policyID: getSelectedWorkspacePolicyID(initialTransaction, action) ?? getReportOrDraftReport(reportID)?.policyID,
        isDistanceRequest: isDistanceRequest(initialTransaction),
        blockDistanceRequestIfNeeded,
        onIOUTypeChange: (nextIOUType) => {
            confirmationIOUTypeRef.current = nextIOUType;
        },
    });

    // The selector reports a pick through both `onParticipantsAdded` and `onFinish`, so this runs once for whichever comes first.
    const returnToConfirmation = () => {
        if (hasReturnedToConfirmationRef.current) {
            return;
        }
        hasReturnedToConfirmationRef.current = true;
        const stackKey = navigation.getState().key;
        navigateBack();

        // Going back doesn't carry the new iouType, so it is set on whichever route the stack shows afterwards.
        const nextIOUType = confirmationIOUTypeRef.current;
        if (!nextIOUType) {
            return;
        }
        Navigation.setParams({iouType: nextIOUType}, undefined, stackKey);
    };

    const addParticipantFromConfirmation = (participantsList: Participant[], selectedPolicy?: OnyxEntry<Policy>) => {
        if (!addParticipantToConfirmation(participantsList, selectedPolicy)) {
            return;
        }
        returnToConfirmation();
    };

    // Anyone can be picked from the confirmation, so SUBMIT and TRACK pick as CREATE.
    const selectorIOUType = isFromConfirmation && (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK) ? CONST.IOU.TYPE.CREATE : iouType;

    // FlashList crashes when its data shrinks while the page animates out, so from the confirmation the list keeps the
    // recipients it opened with.
    const [participantsWhenOpened] = useState(participants);
    const shownParticipants = isFromConfirmation ? participantsWhenOpened : participants;
    const selectedParticipant = isSplitRequest ? undefined : shownParticipants?.find((participant) => participant.selected && !participant.isSender);
    // Participants with a reportID are found in the list and highlighted via initiallySelectedReportID.
    // Those without one (e.g. users to invite who don't have an account yet) must be passed explicitly
    // so formatSectionsFromSearchTerm can render them in the selected section.
    const selectedParticipantsWithoutReport = selectedParticipant && !selectedParticipant.reportID ? [selectedParticipant] : CONST.EMPTY_ARRAY;

    return (
        <StepScreenWrapper
            headerTitle={headerTitle}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="DynamicIOURequestStepParticipants"
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
                participants={isSplitRequest ? shownParticipants : selectedParticipantsWithoutReport}
                onParticipantsAdded={isFromConfirmation ? addParticipantFromConfirmation : addParticipant}
                onFinish={isFromConfirmation ? returnToConfirmation : goToNextStep}
                iouType={selectorIOUType}
                action={action}
                isPerDiemRequest={isPerDiem}
                isTimeRequest={isTime}
                isWorkspacesOnly={isWorkspacesOnly}
                shouldExcludeWorkspaces={shouldExcludeWorkspaces}
                isTransactionFromCreditCardImport={isTransactionFromCreditCardImport}
                shouldExcludeP2P={(initialTransaction?.amount ?? 0) < 0}
                initiallySelectedReportID={selectedParticipant?.reportID}
                shouldMoveSelectedToTop
                shouldBlockParticipantSelection={blockDistanceRequestIfNeeded}
            />
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(DynamicIOURequestStepParticipants));
