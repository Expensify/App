/** Maps the incorporation type the bank account setup already asked for to the company type Wise needs, so the Wise onboarding does not ask again */
import type {IncorporationType} from '@pages/ReimbursementAccount/USD/BusinessInfo/subSteps/TypeBusiness/BusinessTypePicker/types';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type WiseCompanyType = ValueOf<typeof CONST.WISE.COMPANY_TYPE>;

/** The mapping agreed in https://github.com/Expensify/App/pull/104741#issuecomment-6441847048, keyed like the bank account setup saves it. A corporation counts as for-profit, since nothing asks whether it is a nonprofit. */
const COMPANY_TYPE_BY_INCORPORATION_TYPE: Record<IncorporationType, WiseCompanyType> = {
    LLC: CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY,
    CORPORATION: CONST.WISE.COMPANY_TYPE.FOR_PROFIT_CORPORATION,
    PARTNERSHIP: CONST.WISE.COMPANY_TYPE.PARTNERSHIP,
    COOPERATIVE: CONST.WISE.COMPANY_TYPE.OTHER,
    SOLE_PROPRIETORSHIP: CONST.WISE.COMPANY_TYPE.SOLE_PROPRIETORSHIP,
    OTHER: CONST.WISE.COMPANY_TYPE.OTHER,
};

function isIncorporationType(value: string): value is IncorporationType {
    return Object.hasOwn(COMPANY_TYPE_BY_INCORPORATION_TYPE, value);
}

function getWiseCompanyType(incorporationType: string | undefined): WiseCompanyType | undefined {
    return incorporationType && isIncorporationType(incorporationType) ? COMPANY_TYPE_BY_INCORPORATION_TYPE[incorporationType] : undefined;
}

export default getWiseCompanyType;
