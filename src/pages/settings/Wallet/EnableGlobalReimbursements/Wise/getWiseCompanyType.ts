/** Maps the incorporation type the bank account setup already asked for to the company type Wise needs, so the Wise onboarding does not ask again */
import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type IncorporationType = ValueOf<typeof CONST.INCORPORATION_TYPES>;

type WiseCompanyType = ValueOf<typeof CONST.WISE.COMPANY_TYPE>;

/** The mapping agreed in https://github.com/Expensify/App/pull/104741#issuecomment-6441847048. A corporation counts as for-profit, since nothing asks whether it is a nonprofit. */
const COMPANY_TYPE_BY_INCORPORATION_TYPE: Record<IncorporationType, WiseCompanyType> = {
    [CONST.INCORPORATION_TYPES.LLC]: CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY,
    [CONST.INCORPORATION_TYPES.CORPORATION]: CONST.WISE.COMPANY_TYPE.FOR_PROFIT_CORPORATION,
    [CONST.INCORPORATION_TYPES.PARTNERSHIP]: CONST.WISE.COMPANY_TYPE.PARTNERSHIP,
    [CONST.INCORPORATION_TYPES.COOPERATIVE]: CONST.WISE.COMPANY_TYPE.OTHER,
    [CONST.INCORPORATION_TYPES.SOLE_PROPRIETORSHIP]: CONST.WISE.COMPANY_TYPE.SOLE_PROPRIETORSHIP,
    [CONST.INCORPORATION_TYPES.OTHER]: CONST.WISE.COMPANY_TYPE.OTHER,
};

function isIncorporationType(value: string): value is IncorporationType {
    return Object.hasOwn(COMPANY_TYPE_BY_INCORPORATION_TYPE, value);
}

function getWiseCompanyType(incorporationType: string | undefined): WiseCompanyType | undefined {
    return incorporationType && isIncorporationType(incorporationType) ? COMPANY_TYPE_BY_INCORPORATION_TYPE[incorporationType] : undefined;
}

export default getWiseCompanyType;
