import getWiseCompanyType from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseCompanyType';

import CONST from '@src/CONST';

describe('getWiseCompanyType', () => {
    it.each([
        ['LLC', CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY],
        ['CORPORATION', CONST.WISE.COMPANY_TYPE.FOR_PROFIT_CORPORATION],
        ['PARTNERSHIP', CONST.WISE.COMPANY_TYPE.PARTNERSHIP],
        ['COOPERATIVE', CONST.WISE.COMPANY_TYPE.OTHER],
        ['SOLE_PROPRIETORSHIP', CONST.WISE.COMPANY_TYPE.SOLE_PROPRIETORSHIP],
        ['OTHER', CONST.WISE.COMPANY_TYPE.OTHER],
    ])('maps the incorporation type %s to the Wise company type %s', (incorporationType, companyType) => {
        // Given the incorporation type the bank account setup asked for

        // When the Wise onboarding needs its company type
        const result = getWiseCompanyType(incorporationType);

        // Then it follows the agreed mapping, so Wise gets a company type without the admin being asked again
        expect(result).toBe(companyType);
    });

    it.each([undefined, '', 'toString', CONST.INCORPORATION_TYPES.CORPORATION])('gives no company type for the incorporation type %p', (incorporationType) => {
        // Given a bank account without an incorporation type, or with one the mapping does not know, such as the shown label instead of the saved key

        // When the Wise onboarding needs its company type
        const result = getWiseCompanyType(incorporationType);

        // Then no company type is made up
        expect(result).toBeUndefined();
    });
});
