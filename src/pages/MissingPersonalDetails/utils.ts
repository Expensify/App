import type {OnyxEntry} from 'react-native-onyx';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import type {PersonalDetailsForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {PrivatePersonalDetails} from '@src/types/onyx';

function getSubstepValues(privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>, personalDetailsDraft: OnyxEntry<PersonalDetailsForm>): PersonalDetailsForm {
    const address = PersonalDetailsUtils.getCurrentAddress(privatePersonalDetails);
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

// eslint-disable-next-line import/prefer-default-export
export {getSubstepValues};
