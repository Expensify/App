import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

const {PREFIX, FIRST_NAME, LAST_NAME, NATIONALITY, OWNERSHIP_PERCENTAGE, DOB, STREET, CITY, STATE, ZIP_CODE, COUNTRY} =
    CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

type DraftValuesForBeneficialOwners = {
    beneficialOwnerKeys: string[];
    [key: string]: string | string[];
};

function getDraftValuesForBeneficialOwners(reimbursementAccount: OnyxEntry<ReimbursementAccount>): DraftValuesForBeneficialOwners {
    const owners = reimbursementAccount?.achData?.corpay?.[INPUT_IDS.ADDITIONAL_DATA.CORPAY.BENEFICIAL_OWNERS] ?? [];
    const beneficialOwnerKeys = owners.map((o) => o.uid).filter((uid): uid is string => !!uid);

    const result: DraftValuesForBeneficialOwners = {beneficialOwnerKeys};

    for (const owner of owners) {
        if (!owner.uid) {
            continue;
        }
        const fullName = (owner.fullName ?? '').trim();
        const firstSpaceIndex = fullName.indexOf(' ');
        const lastSpaceIndex = fullName.lastIndexOf(' ');
        const firstName = firstSpaceIndex === -1 ? fullName : fullName.substring(0, firstSpaceIndex).trim();
        const lastName = firstSpaceIndex === -1 ? '' : fullName.substring(lastSpaceIndex).trim();

        const [street = '', city = '', state = '', zipCode = '', country = ''] = (owner.residentialAddress ?? '').split(', ');

        const userPrefix = `${PREFIX}_${owner.uid}`;
        result[`${userPrefix}_${FIRST_NAME}`] = firstName;
        result[`${userPrefix}_${LAST_NAME}`] = lastName;
        result[`${userPrefix}_${NATIONALITY}`] = owner.nationality ?? '';
        result[`${userPrefix}_${OWNERSHIP_PERCENTAGE}`] = owner.ownershipPercentage ?? '';
        result[`${userPrefix}_${DOB}`] = owner.dob ?? '';
        result[`${userPrefix}_${STREET}`] = street;
        result[`${userPrefix}_${CITY}`] = city;
        result[`${userPrefix}_${STATE}`] = state;
        result[`${userPrefix}_${ZIP_CODE}`] = zipCode;
        result[`${userPrefix}_${COUNTRY}`] = country;
    }

    return result;
}

export type {DraftValuesForBeneficialOwners};
export default getDraftValuesForBeneficialOwners;
