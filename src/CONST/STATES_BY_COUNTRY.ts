import CONST from '.';

/**
 * The states of countries other than the US and Canada, whose lists live in expensify-common, keyed by their ISO 3166-2 code.
 * These lists belong in expensify-common next to STATES and PROVINCES.
 */
const STATES_BY_COUNTRY: Partial<Record<string, Record<string, string>>> = {
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

export default STATES_BY_COUNTRY;
