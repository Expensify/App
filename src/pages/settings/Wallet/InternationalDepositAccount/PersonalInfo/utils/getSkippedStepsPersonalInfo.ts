import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
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

    const isUsOrCanada = currentAddress?.country === CONST.COUNTRY.US || currentAddress?.country === CONST.COUNTRY.CA;
    const hasValidState = !isUsOrCanada || !!currentAddress?.state;

    if (!!currentAddress?.street && !!currentAddress?.city && hasValidState && !!currentAddress?.zip) {
        skippedSteps.push(2);
    }

    if (data?.phoneNumber) {
        skippedSteps.push(3);
    }

    return skippedSteps;
}

export default getSkippedStepsPersonalInfo;
