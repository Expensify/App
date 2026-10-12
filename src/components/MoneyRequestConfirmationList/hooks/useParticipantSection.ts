import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePreferredPolicy from '@hooks/usePreferredPolicy';

import CONST from '@src/CONST';

import {useCallback, useEffect, useMemo} from 'react';

import type {UseParticipantSectionParams} from './types';

import useConfirmationSections from './useConfirmationSections';
import useSplitParticipants from './useSplitParticipants';

/**
 * The participant part of the confirmation: the participant rows, the row-level errors they carry,
 * and the tap that opens the participant picker.
 */
function useParticipantSection({
    transaction,
    iouType,
    isScanRequest,
    isTypeSplit,
    isTypeInvoice,
    isPerDiemRequest,
    isTimeRequest,
    shouldHideToSection,
    shouldShowReadOnlySplits,
    selectedParticipantsProp,
    payeePersonalDetailsProp,
    formError,
    clearFormErrors,
    iouAmount,
    iouCurrencyCode,
    onOpenParticipantPicker,
}: UseParticipantSectionParams) {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();

    // The Test Drive tooltip itself lives in `ConfirmationFooterContent`, which mounts `useReceiptTraining`.
    const isTestReceipt = transaction?.receipt?.isTestReceipt ?? false;

    const selectedParticipants = selectedParticipantsProp.filter((participant) => participant.selected);
    const payeePersonalDetails = payeePersonalDetailsProp ?? currentUserPersonalDetails;

    const participantRowErrors = useMemo(() => {
        if (formError !== 'iou.error.noParticipantSelected' && formError !== 'violations.missingAttendees') {
            return undefined;
        }
        return {participants: translate(formError)};
    }, [formError, translate]);

    useEffect(() => {
        if (selectedParticipants.length === 0) {
            return;
        }
        clearFormErrors(['iou.error.noParticipantSelected']);
    }, [selectedParticipants.length, clearFormErrors]);

    const dismissParticipantRowError = useCallback(() => {
        clearFormErrors(['iou.error.noParticipantSelected', 'violations.missingAttendees']);
    }, [clearFormErrors]);

    const {splitParticipants, getSplitSectionHeader} = useSplitParticipants({
        isTypeSplit,
        shouldShowReadOnlySplits,
        payeePersonalDetails,
        selectedParticipants,
        transaction,
        iouAmount,
        iouCurrencyCode,
        currentUserAccountID: currentUserPersonalDetails.accountID,
    });

    const isFromGlobalCreateAndCanEditParticipant = !!transaction?.isFromGlobalCreate && !isPerDiemRequest && !isTimeRequest;
    const canEditParticipant = isFromGlobalCreateAndCanEditParticipant && !isTestReceipt && (!isRestrictedToPreferredPolicy || isTypeInvoice);
    const isManualRequest = transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL;
    const shouldForceTopEmptySections = iouType === CONST.IOU.TYPE.CREATE || isManualRequest || isScanRequest;

    const sections = useConfirmationSections({
        isTypeSplit,
        isTypeInvoice,
        shouldHideToSection,
        shouldForceTopEmptySections,
        participantRowErrors,
        canEditParticipant,
        payeePersonalDetails,
        splitParticipants,
        selectedParticipants,
        getSplitSectionHeader,
    });

    const navigateToParticipantPage = () => {
        if (!canEditParticipant) {
            return;
        }

        onOpenParticipantPicker?.();
    };

    return {selectedParticipants, sections, navigateToParticipantPage, dismissParticipantRowError};
}

export default useParticipantSection;
