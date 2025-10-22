import CONST from '@src/CONST';

/**
 * Checks whether passed currency requires an additional step where we ask for signed form
 * @param currency
 */
function requiresDocusignStep(currency: string | undefined): boolean {
    switch (currency) {
        case CONST.CURRENCY.USD:
        case CONST.CURRENCY.CAD:
        case CONST.CURRENCY.AUD:
            return true;
        default:
            return false;
    }
}

export default requiresDocusignStep;
