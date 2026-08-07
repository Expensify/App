import {getCurrentAddress} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import type {PrivatePersonalDetails} from '@src/types/onyx';

/**
 * Returns the steps to skip in the Personal Info flow based on already existing data.
 *
 * The international bank account details step sits at index 1 (right after the bank account details step),
 * so the legal name / address / phone number steps that follow it are at indexes 2, 3 and 4.
 */
function getSkippedStepsPersonalInfo(data: Partial<PrivatePersonalDetails> | undefined, shouldSkipInternationalBankAccountDetails: boolean): number[] {
    const currentAddress = getCurrentAddress(data);
    const skippedSteps = [];

    if (shouldSkipInternationalBankAccountDetails) {
        skippedSteps.push(1);
    }

    if (!!data?.legalFirstName && !!data?.legalLastName) {
        skippedSteps.push(2);
    }

    const isUsOrCanada = currentAddress?.country === CONST.COUNTRY.US || currentAddress?.country === CONST.COUNTRY.CA;
    const hasValidState = !isUsOrCanada || !!currentAddress?.state;

    if (!!currentAddress?.street && !!currentAddress?.city && hasValidState && !!currentAddress?.zip) {
        skippedSteps.push(3);
    }

    if (data?.phoneNumber) {
        skippedSteps.push(4);
    }

    return skippedSteps;
}

export default getSkippedStepsPersonalInfo;
