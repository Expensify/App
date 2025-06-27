import CONST from '@src/CONST';

/**
 * Checks whether passed currency requires an additional step where we ask for signed form
 * @param currency
 */
function requiresDocusignStep(currency: string | undefined): boolean {
    switch (currency) {
        case CONST.CURRENCY.USD:
            return true;
        case CONST.CURRENCY.CAD:
            return true;
        case CONST.CURRENCY.AUD:
            return true;
        case CONST.CURRENCY.GBP:
            return false;
        case CONST.CURRENCY.EUR:
            return false;
        default:
            return false;
    }
}

export default requiresDocusignStep;
