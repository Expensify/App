import {isRequiredFulfilled} from '@libs/ValidationUtils';

import CONST from '@src/CONST';

import {useState} from 'react';

import useLocalize from './useLocalize';

type UseTransactionStartDateValidationParams = {
    /** Whether the page is asking for a date at all, since the other option needs none */
    dateOption: string;

    /** The date the page is holding, in the format the app stores */
    startDate: string;
};

type UseTransactionStartDateValidationResult = {
    /** What the date field shows, which is nothing until the page has been submitted without a date */
    requiredError: string;

    /** Handed to the date field, which reports an entry it could not read as a date */
    onValidationErrorChange: (error: string) => void;

    /** Takes the required error back down, since picking an option is the user answering the question again */
    forgetSubmitAttempt: () => void;

    /** Whether the page may be saved, recording the required error when it may not */
    validateOnSubmit: () => boolean;
};

/**
 * The shared wiring behind a transaction start date, where a custom date is required and the field can report an entry
 * it refused to hand over. Both pages asking for one answer it the same way, so they ask this rather than each other.
 */
function useTransactionStartDateValidation({dateOption, startDate}: UseTransactionStartDateValidationParams): UseTransactionStartDateValidationResult {
    const {translate} = useLocalize();
    // A required error belongs after the page has been submitted, and not while the date is still being filled in
    const [wasSubmittedWithoutDate, setWasSubmittedWithoutDate] = useState(false);
    // The field reports a date its calendar would never have offered, which only typing can reach
    const [dateError, setDateError] = useState('');

    const isCustom = dateOption === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM;

    return {
        requiredError: wasSubmittedWithoutDate && !isRequiredFulfilled(startDate) ? translate('common.error.fieldRequired') : '',
        onValidationErrorChange: setDateError,
        forgetSubmitAttempt: () => setWasSubmittedWithoutDate(false),
        validateOnSubmit: () => {
            if (isCustom && !isRequiredFulfilled(startDate)) {
                setWasSubmittedWithoutDate(true);
                return false;
            }

            // An entry the field could not read is never handed over, so saving would keep the date from before it
            return !(isCustom && dateError);
        },
    };
}

export default useTransactionStartDateValidation;
