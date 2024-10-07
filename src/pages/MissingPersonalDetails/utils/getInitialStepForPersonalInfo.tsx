import type {OnyxEntry} from 'react-native-onyx';
import type {PersonalDetailsForm} from '@src/types/form/PersonalDetailsForm';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

/**
 * Returns the initial step for the Personal Info step based on already existing data
 */
function getInitialStepForPersonalInfo(data: OnyxEntry<PersonalDetailsForm>): number {
    if (!data?.[INPUT_IDS.LEGAL_FIRST_NAME] || !data?.[INPUT_IDS.LEGAL_LAST_NAME]) {
        return 0;
    }

    if (!data?.[INPUT_IDS.DATE_OF_BIRTH]) {
        return 1;
    }

    if (
        !data?.[INPUT_IDS.ADDRESS_LINE_1] ||
        !data?.[INPUT_IDS.ADDRESS_LINE_2] ||
        !data?.[INPUT_IDS.CITY] ||
        !data?.[INPUT_IDS.STATE] ||
        !data?.[INPUT_IDS.ZIP_POST_CODE] ||
        !data?.[INPUT_IDS.COUNTRY]
    ) {
        return 2;
    }

    return 3;
}

export default getInitialStepForPersonalInfo;
