import type {OnyxEntry} from 'react-native-onyx';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {PersonalDetailsForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {PrivatePersonalDetails} from '@src/types/onyx';

function getSubPageValues(privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>, personalDetailsDraft: OnyxEntry<PersonalDetailsForm>): PersonalDetailsForm {
    const address = getCurrentAddress(privatePersonalDetails);
    const {street} = address ?? {};
    const [street1, street2] = street ? street.split('\n') : [undefined, undefined];
    return {
        [INPUT_IDS.LEGAL_FIRST_NAME]: personalDetailsDraft?.[INPUT_IDS.LEGAL_FIRST_NAME] ?? privatePersonalDetails?.legalFirstName ?? '',
        [INPUT_IDS.LEGAL_LAST_NAME]: personalDetailsDraft?.[INPUT_IDS.LEGAL_LAST_NAME] ?? privatePersonalDetails?.legalLastName ?? '',
        [INPUT_IDS.DATE_OF_BIRTH]: personalDetailsDraft?.[INPUT_IDS.DATE_OF_BIRTH] ?? privatePersonalDetails?.dob ?? '',
        [INPUT_IDS.PHONE_NUMBER]: personalDetailsDraft?.[INPUT_IDS.PHONE_NUMBER] ?? privatePersonalDetails?.phoneNumber ?? '',
        [INPUT_IDS.ADDRESS_LINE_1]: personalDetailsDraft?.[INPUT_IDS.ADDRESS_LINE_1] ?? street1 ?? '',
        [INPUT_IDS.ADDRESS_LINE_2]: personalDetailsDraft?.[INPUT_IDS.ADDRESS_LINE_2] ?? street2 ?? '',
        [INPUT_IDS.CITY]: personalDetailsDraft?.[INPUT_IDS.CITY] ?? address?.city ?? '',
        [INPUT_IDS.STATE]: personalDetailsDraft?.[INPUT_IDS.STATE] ?? address?.state ?? '',
        [INPUT_IDS.ZIP_POST_CODE]: personalDetailsDraft?.[INPUT_IDS.ZIP_POST_CODE] ?? address?.zip ?? '',
        [INPUT_IDS.COUNTRY]: personalDetailsDraft?.[INPUT_IDS.COUNTRY] ?? address?.country ?? '',
    };
}

function getInitialSubPage(values: PersonalDetailsForm) {
    if (values[INPUT_IDS.LEGAL_FIRST_NAME] === '' || values[INPUT_IDS.LEGAL_LAST_NAME] === '') {
        return CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.LEGAL_NAME;
    }
    if (values[INPUT_IDS.DATE_OF_BIRTH] === '') {
        return CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.DATE_OF_BIRTH;
    }
    if (
        values[INPUT_IDS.ADDRESS_LINE_1] === '' ||
        values[INPUT_IDS.CITY] === '' ||
        values[INPUT_IDS.STATE] === '' ||
        values[INPUT_IDS.ZIP_POST_CODE] === '' ||
        values[INPUT_IDS.COUNTRY] === ''
    ) {
        return CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.ADDRESS;
    }
    if (values[INPUT_IDS.PHONE_NUMBER] === '') {
        return CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.PHONE_NUMBER;
    }
    return CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.CONFIRM;
}

export {getSubPageValues, getInitialSubPage};
