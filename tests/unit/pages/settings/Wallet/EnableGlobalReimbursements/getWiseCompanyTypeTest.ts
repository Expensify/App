import getWiseCompanyType from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseCompanyType';

import CONST from '@src/CONST';

describe('getWiseCompanyType', () => {
    it.each([
        [CONST.INCORPORATION_TYPES.LLC, CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY],
        [CONST.INCORPORATION_TYPES.CORPORATION, CONST.WISE.COMPANY_TYPE.FOR_PROFIT_CORPORATION],
        [CONST.INCORPORATION_TYPES.PARTNERSHIP, CONST.WISE.COMPANY_TYPE.PARTNERSHIP],
        [CONST.INCORPORATION_TYPES.COOPERATIVE, CONST.WISE.COMPANY_TYPE.OTHER],
        [CONST.INCORPORATION_TYPES.SOLE_PROPRIETORSHIP, CONST.WISE.COMPANY_TYPE.SOLE_PROPRIETORSHIP],
        [CONST.INCORPORATION_TYPES.OTHER, CONST.WISE.COMPANY_TYPE.OTHER],
    ])('maps the incorporation type %s to the Wise company type %s', (incorporationType, companyType) => {
        // Given the incorporation type the bank account setup asked for

        // When the Wise onboarding needs its company type
        const result = getWiseCompanyType(incorporationType);

        // Then it follows the agreed mapping, so Wise gets a company type without the admin being asked again
        expect(result).toBe(companyType);
    });

    it.each([undefined, '', 'toString'])('gives no company type for the incorporation type %p', (incorporationType) => {
        // Given a bank account without an incorporation type, or with one the mapping does not know

        // When the Wise onboarding needs its company type
        const result = getWiseCompanyType(incorporationType);

        // Then no company type is made up
        expect(result).toBeUndefined();
    });
});
