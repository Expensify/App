import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';
import type {PersonalInfoStepProps} from '@src/types/form/WalletAdditionalDetailsForm';

const personalInfoKeys = INPUT_IDS.PERSONAL_INFO_STEP;

/**
 * Returns the initial substep for the Personal Info step based on already existing data
 */
function getInitialSubstepForPersonalInfo(data: PersonalInfoStepProps): number {
    if (data[personalInfoKeys.FIRST_NAME] === '' || data[personalInfoKeys.LAST_NAME] === '') {
        return 0;
    }

    if (data[personalInfoKeys.DOB] === '') {
        return 1;
    }

    if (data[personalInfoKeys.STREET] === '' || data[personalInfoKeys.CITY] === '' || data[personalInfoKeys.STATE] === '' || data[personalInfoKeys.ZIP_CODE] === '') {
        return 2;
    }

    if (data[personalInfoKeys.PHONE_NUMBER] === '') {
        return 3;
    }

    if (data[personalInfoKeys.SSN_LAST_4] === '') {
        return 4;
    }

    return 5;
}

export default getInitialSubstepForPersonalInfo;
