import type {Country} from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    LOCATION_NAME: 'locationName',
    ADDRESS_LINE_1: 'addressLine1',
    ADDRESS_LINE_2: 'addressLine2',
    COUNTRY: 'country',
    STATE: 'state',
    CITY: 'city',
    ZIP_POST_CODE: 'zipPostCode',
    IS_PRIMARY: 'isPrimary',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type WorkspaceOfficeLocationForm = Form<
    InputID,
    {
        [INPUT_IDS.LOCATION_NAME]: string;
        [INPUT_IDS.ADDRESS_LINE_1]: string;
        [INPUT_IDS.ADDRESS_LINE_2]: string;
        [INPUT_IDS.COUNTRY]: Country | '';
        [INPUT_IDS.STATE]: string;
        [INPUT_IDS.CITY]: string;
        [INPUT_IDS.ZIP_POST_CODE]: string;
        [INPUT_IDS.IS_PRIMARY]: boolean;
    }
>;

export type {WorkspaceOfficeLocationForm};
export default INPUT_IDS;
