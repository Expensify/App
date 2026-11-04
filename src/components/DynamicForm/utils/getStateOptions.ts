import CONST from '@src/CONST';

/** The states Wise needs a code for outside the US and Canada, whose lists AddressFormFields already has, keyed by their ISO 3166-2 code */
const STATE_OPTIONS_BY_COUNTRY: Partial<Record<string, Record<string, string>>> = {
    [CONST.COUNTRY.AU]: {
        ACT: 'Australian Capital Territory',
        NSW: 'New South Wales',
        NT: 'Northern Territory',
        QLD: 'Queensland',
        SA: 'South Australia',
        TAS: 'Tasmania',
        VIC: 'Victoria',
        WA: 'Western Australia',
    },
    // cspell:disable
    [CONST.COUNTRY.BR]: {
        AC: 'Acre',
        AL: 'Alagoas',
        AP: 'Amapá',
        AM: 'Amazonas',
        BA: 'Bahia',
        CE: 'Ceará',
        DF: 'Distrito Federal',
        ES: 'Espírito Santo',
        GO: 'Goiás',
        MA: 'Maranhão',
        MT: 'Mato Grosso',
        MS: 'Mato Grosso do Sul',
        MG: 'Minas Gerais',
        PA: 'Pará',
        PB: 'Paraíba',
        PR: 'Paraná',
        PE: 'Pernambuco',
        PI: 'Piauí',
        RJ: 'Rio de Janeiro',
        RN: 'Rio Grande do Norte',
        RS: 'Rio Grande do Sul',
        RO: 'Rondônia',
        RR: 'Roraima',
        SC: 'Santa Catarina',
        SP: 'São Paulo',
        SE: 'Sergipe',
        TO: 'Tocantins',
    },
    // cspell:enable
};

function getStateOptions(country: string): Record<string, string> | undefined {
    return STATE_OPTIONS_BY_COUNTRY[country];
}

export default getStateOptions;
