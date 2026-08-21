import type {Country} from '@src/CONST';
import CONST from '@src/CONST';

function mapCurrencyToCountry(currency: string): Country | '' {
    switch (currency) {
        case CONST.CURRENCY.USD:
            return CONST.COUNTRY.US;
        case CONST.CURRENCY.AUD:
            return CONST.COUNTRY.AU;
        case CONST.CURRENCY.CAD:
            return CONST.COUNTRY.CA;
        case CONST.CURRENCY.GBP:
            return CONST.COUNTRY.GB;
        default:
            return '';
    }
}

export default mapCurrencyToCountry;
