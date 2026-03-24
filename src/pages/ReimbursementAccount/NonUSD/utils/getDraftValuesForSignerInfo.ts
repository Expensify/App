import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {ReimbursementAccount} from '@src/types/onyx';

const {FULL_NAME, DATE_OF_BIRTH, JOB_TITLE, ADDRESS, STREET, CITY, STATE, ZIP_CODE} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

type DraftValuesForSignerInfo = {
    isUserDirector: boolean;
    [FULL_NAME]?: string;
    [JOB_TITLE]?: string;
    [DATE_OF_BIRTH]?: string;
    [STREET]?: string;
    [CITY]?: string;
    [STATE]?: string;
    [ZIP_CODE]?: string;
};

/**
 * Populates signer info draft values from the saved achData when returning to an in-progress flow.
 */
function getDraftValuesForSignerInfo(reimbursementAccount: OnyxEntry<ReimbursementAccount>): DraftValuesForSignerInfo {
    const corpay = reimbursementAccount?.achData?.corpay;
    const signerFullName = corpay?.[FULL_NAME];

    const result: DraftValuesForSignerInfo = {
        isUserDirector: !!signerFullName,
    };

    if (!signerFullName) {
        return result;
    }

    result[FULL_NAME] = signerFullName;

    const jobTitle = corpay?.[JOB_TITLE];
    if (jobTitle) {
        result[JOB_TITLE] = String(jobTitle);
    }

    const dateOfBirth = corpay?.[DATE_OF_BIRTH];
    if (dateOfBirth) {
        result[DATE_OF_BIRTH] = String(dateOfBirth);
    }

    const address = corpay?.[ADDRESS];
    if (address) {
        const [street = '', city = '', state = '', zipCode = ''] = String(address).split(', ');
        result[STREET] = street;
        result[CITY] = city;
        result[STATE] = state;
        result[ZIP_CODE] = zipCode;
    }

    return result;
}

export type {DraftValuesForSignerInfo};
export default getDraftValuesForSignerInfo;
