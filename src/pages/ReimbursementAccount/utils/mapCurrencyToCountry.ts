import CONST from '@src/CONST';

function mapCurrencyToCountry(currency: string): string {
    switch (currency) {
        case CONST.CURRENCY.USD:
            return 'US';
        case CONST.CURRENCY.AUD:
            return 'AU';
        case CONST.CURRENCY.CAD:
            return 'CA';
        case CONST.CURRENCY.GBP:
            return 'GB';
        default:
            return '';
    }
}

export default mapCurrencyToCountry;
