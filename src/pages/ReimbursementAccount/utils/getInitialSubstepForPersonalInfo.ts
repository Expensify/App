import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

const personalInfoKeys = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;

type PersonalInfoData = Record<ValueOf<typeof personalInfoKeys>, string>;

/**
 * Returns the initial substep for the Personal Info step based on already existing data
 */
function getInitialSubstepForPersonalInfo(data: PersonalInfoData): number {
    if (data[personalInfoKeys.FIRST_NAME] === '' && data[personalInfoKeys.LAST_NAME] === '') {
        return 0;
    }

    if (data[personalInfoKeys.DOB] === '') {
        return 1;
    }

    if (data[personalInfoKeys.SSN_LAST_4] === '') {
        return 2;
    }

    if (data[personalInfoKeys.STREET] === '' || data[personalInfoKeys.CITY] === '' || data[personalInfoKeys.STATE] === '' || data[personalInfoKeys.ZIP_CODE] === '') {
        return 3;
    }

    return 4;
}

export default getInitialSubstepForPersonalInfo;
