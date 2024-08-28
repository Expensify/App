import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {TaxRate, TaxRatesWithDefault} from '@src/types/onyx';

function formatTaxText(translate: LocaleContextProps['translate'], taxID: string, taxRate: TaxRate, policyTaxRates?: TaxRatesWithDefault) {
    const taxRateText = `${taxRate.name} ${CONST.DOT_SEPARATOR} ${taxRate.value}`;

    if (!policyTaxRates) {
        return taxRateText;
    }

    const {defaultExternalID, foreignTaxDefault} = policyTaxRates;
    let suffix;

    if (taxID === defaultExternalID && taxID === foreignTaxDefault) {
        suffix = translate('common.default');
    } else if (taxID === defaultExternalID) {
        suffix = translate('workspace.taxes.workspaceDefault');
    } else if (taxID === foreignTaxDefault) {
        suffix = translate('workspace.taxes.foreignDefault');
    }
    return `${taxRateText}${suffix ? ` ${CONST.DOT_SEPARATOR} ${suffix}` : ``}`;
}

// eslint-disable-next-line import/prefer-default-export
export {formatTaxText};
