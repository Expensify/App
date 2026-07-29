import getTravelAcceptTermsRoute from '@libs/getTravelAcceptTermsRoute';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

const DYNAMIC_TERMS_ROUTE = 'travel/example.com/accept/policy-1';

jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({
    __esModule: true,
    default: jest.fn(() => DYNAMIC_TERMS_ROUTE),
}));

const DOMAIN = 'example.com';
const POLICY_ID = 'policy-1';

function buildPolicy(outputCurrency: string, travelSettings: Policy['travelSettings']): Policy {
    return {...createRandomPolicy(1), id: POLICY_ID, outputCurrency, travelSettings};
}

describe('getTravelAcceptTermsRoute', () => {
    it('routes to the tax ID page for a non-USD workspace that is not yet provisioned and has no tax ID', () => {
        const policy = buildPolicy('GBP', {});
        expect(getTravelAcceptTermsRoute(DOMAIN, POLICY_ID, policy)).toBe(ROUTES.TRAVEL_LEGAL_ENTITY_TAX_ID.getRoute(DOMAIN, POLICY_ID));
    });

    it('routes to the terms page for a USD workspace', () => {
        const policy = buildPolicy(CONST.CURRENCY.USD, {});
        expect(getTravelAcceptTermsRoute(DOMAIN, POLICY_ID, policy)).toBe(DYNAMIC_TERMS_ROUTE);
    });

    it('routes to the terms page for an already-provisioned non-USD workspace', () => {
        const policy = buildPolicy('GBP', {spotnanaCompanyID: 'company-uuid'});
        expect(getTravelAcceptTermsRoute(DOMAIN, POLICY_ID, policy)).toBe(DYNAMIC_TERMS_ROUTE);
    });

    it('routes to the terms page for a non-USD workspace that already has a tax ID', () => {
        const policy = buildPolicy('GBP', {taxID: 'GB123456789'});
        expect(getTravelAcceptTermsRoute(DOMAIN, POLICY_ID, policy)).toBe(DYNAMIC_TERMS_ROUTE);
    });

    it('routes to the terms page when the policy is undefined', () => {
        expect(getTravelAcceptTermsRoute(DOMAIN, POLICY_ID, undefined)).toBe(DYNAMIC_TERMS_ROUTE);
    });
});
