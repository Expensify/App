import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePreferredPolicy from '@hooks/usePreferredPolicy';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import {useCallback, useEffect, useMemo} from 'react';

import useConfirmationSections from './useConfirmationSections';
import useSplitParticipants from './useSplitParticipants';

type UseParticipantSectionParams = {
    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    iouType: IOUType;

    /** Whether the amount shown is a scan's, which forces the top sections even when the "To" section is hidden */
    isScanRequest: boolean;

    isTypeSplit: boolean;
    isTypeInvoice: boolean;
    isPerDiemRequest: boolean;
    isTimeRequest: boolean;

    shouldHideToSection: boolean;

    /** Whether the split rows render without editable amount inputs */
    shouldShowReadOnlySplits: boolean;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipantsProp: Participant[];

    /** Payee of the expense with login */
    payeePersonalDetailsProp?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    /** The form error the participant row surfaces when it is one of the participant-level ones */
    formError: TranslationPaths | '';

    clearFormErrors: (errors: string[]) => void;

    iouAmount: number;
    iouCurrencyCode: string;

    /** Opens the participant picker; omitted by the variants whose participant row can never be edited */
    onOpenParticipantPicker?: () => void;
};

/**
 * The "To:" / split-participant part of the confirmation: the participant rows the list shows, the row-level
 * errors they carry, and the tap that opens the participant picker. The rest of the confirmation — policy,
 * amounts, the form-error machinery — comes to it as resolved inputs; the rows and their handlers are all the
 * list needs.
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

    /**
     * Navigate to the participant step
     */
    const navigateToParticipantPage = () => {
        if (!canEditParticipant) {
            return;
        }

        onOpenParticipantPicker?.();
    };

    return {selectedParticipants, sections, navigateToParticipantPage, dismissParticipantRowError};
}

export default useParticipantSection;
