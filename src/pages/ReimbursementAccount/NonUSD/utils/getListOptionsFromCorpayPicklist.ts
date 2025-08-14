import CONST from '@src/CONST';
import type {Picklist} from '@src/types/onyx/CorpayOnboardingFields';

function getListOptionsFromCorpayPicklist(corpayPicklist: Picklist | undefined): Record<string, string> {
    if (!corpayPicklist) {
        return {};
    }

    return corpayPicklist.reduce(
        (accumulator, currentValue) => {
            if (currentValue.stringValue === CONST.NON_USD_BANK_ACCOUNT.CORPAY_UNDEFINED_OPTION_VALUE) {
                return accumulator;
            }

            accumulator[currentValue.name] = currentValue.stringValue;
            return accumulator;
        },
        {} as Record<string, string>,
    );
}

export default getListOptionsFromCorpayPicklist;
