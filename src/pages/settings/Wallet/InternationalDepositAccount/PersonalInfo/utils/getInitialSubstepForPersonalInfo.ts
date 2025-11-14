import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';
import type {PersonalBankAccountForm} from '@src/types/form/PersonalBankAccountForm';

const personalInfoKeys = INPUT_IDS.BANK_INFO_STEP;

/**
 * Returns the initial substep for the Personal Info step based on already existing data
 */
function getInitialSubstepForPersonalInfo(data: Partial<PersonalBankAccountForm>): number {
    if (data[personalInfoKeys.FIRST_NAME] === '' || data[personalInfoKeys.LAST_NAME] === '') {
        return 0;
    }

    if (data[personalInfoKeys.STREET] === '' || data[personalInfoKeys.CITY] === '' || data[personalInfoKeys.STATE] === '' || data[personalInfoKeys.ZIP_CODE] === '') {
        return 1;
    }

    if (data[personalInfoKeys.PHONE_NUMBER] === '') {
        return 2;
    }

    return 3;
}

export default getInitialSubstepForPersonalInfo;
