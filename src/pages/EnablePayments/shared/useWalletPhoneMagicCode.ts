import useOnyx from '@hooks/useOnyx';

import type {UpdatePersonalDetailsForWalletParams} from '@libs/API/parameters';
import {parsePhoneNumber} from '@libs/PhoneNumber';

import {clearWalletAdditionalDetailsErrors, updatePersonalDetails} from '@userActions/Wallet';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef, useState} from 'react';

/**
 * Shared magic-code handling for the wallet KYC personal-details flows. Changing an existing phone number is protected
 * by a magic code because it is used for card 3DS verification, so both flows prompt for a code before submitting the
 * change and keep the prompt open until the code is accepted.
 */
function useWalletPhoneMagicCode() {
    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const [formData] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    // The details the user submitted, held while we prompt for a magic code to confirm a phone number change
    const submittedPersonalDetailsRef = useRef<UpdatePersonalDetailsForWalletParams | null>(null);
    const [isConfirmingMagicCode, setIsConfirmingMagicCode] = useState(false);

    // The backend requires a valid magic code to change an existing phone number. Keep the prompt open if the
    // submitted code was missing or invalid, even when the change wasn't detected client-side.
    const isMagicCodeRequired = isConfirmingMagicCode || walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.INCORRECT_MAGIC_CODE;

    // Once a submission finishes, keep prompting only if the magic code was missing or invalid; otherwise dismiss the
    // prompt so the flow can advance (e.g. to Onfido or KBA questions).
    const wasSubmittingRef = useRef(false);
    useEffect(() => {
        if (formData?.isLoading) {
            wasSubmittingRef.current = true;
            return;
        }
        if (!wasSubmittingRef.current) {
            return;
        }
        wasSubmittingRef.current = false;
        setIsConfirmingMagicCode(walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.INCORRECT_MAGIC_CODE);
    }, [formData?.isLoading, walletAdditionalDetails?.errorCode]);

    // Submits the personal details, first prompting for a magic code when an existing phone number is being changed.
    const submitPersonalDetails = (personalDetails: UpdatePersonalDetailsForWalletParams) => {
        submittedPersonalDetailsRef.current = personalDetails;

        // The stored phone number keeps its country code, so normalize it the same way as the submitted one before
        // comparing, otherwise an unchanged phone would look like a change and wrongly prompt for a magic code.
        const storedPhoneNumber = privatePersonalDetails?.phoneNumber;
        const normalizedStoredPhoneNumber = (storedPhoneNumber && parsePhoneNumber(storedPhoneNumber, {regionCode: CONST.COUNTRY.US}).number?.significant) ?? '';
        const hasPhoneNumberChanged = !!normalizedStoredPhoneNumber && personalDetails.phoneNumber !== normalizedStoredPhoneNumber;
        if (hasPhoneNumberChanged) {
            setIsConfirmingMagicCode(true);
            return;
        }

        // Attempt to set the personal details
        updatePersonalDetails(personalDetails);
    };

    const confirmPersonalDetailsWithMagicCode = (validateCode: string) => {
        if (!submittedPersonalDetailsRef.current) {
            return;
        }
        updatePersonalDetails({...submittedPersonalDetailsRef.current, validateCode});
    };

    const closeMagicCodePrompt = () => {
        setIsConfirmingMagicCode(false);
        clearWalletAdditionalDetailsErrors();
    };

    return {isMagicCodeRequired, submitPersonalDetails, confirmPersonalDetailsWithMagicCode, closeMagicCodePrompt};
}

export default useWalletPhoneMagicCode;
