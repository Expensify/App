import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import type {PrivatePersonalDetails} from '@src/types/onyx';

/**
 * Returns the initial substep for the Personal Info step based on already existing data
 */
function getSkippedStepsPersonalInfo(data?: Partial<PrivatePersonalDetails>): number[] {
    const currentAddress = getCurrentAddress(data);
    const skippedSteps = [];
    if (!!data?.legalFirstName && !!data?.legalLastName) {
        skippedSteps.push(1);
    }

    if (!!currentAddress?.addressLine1 && !!currentAddress?.city && currentAddress?.state && !!currentAddress?.zipCode) {
        skippedSteps.push(2);
    }

    if (data?.phoneNumber) {
        skippedSteps.push(3);
    }

    return skippedSteps;
}

export default getSkippedStepsPersonalInfo;
