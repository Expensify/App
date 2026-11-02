import {getPages} from '@components/DynamicForm/utils/paginate';

import getWiseOnboardingForm, {getFirstUnansweredRequirementPageKey, getOnboardingStep} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseOnboardingForm';
import getKYCRequirementPage from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/kycRequirementLayouts';

import CONST from '@src/CONST';
import type {WiseKYCRequirement} from '@src/types/onyx/WiseKYCReview';

const PROFILE_PAGE_KEYS = ['representative', 'business'];
const INFO_ROUTE_KEY = 'business-source-of-wealth-info';
const PROOF_ROUTE_KEY = 'business-source-of-wealth-proof';

function getRequirement(key: string, overrides: Partial<WiseKYCRequirement> = {}): WiseKYCRequirement {
    return {key, state: CONST.WISE.KYC_REQUIREMENT_STATE.NOT_PROVIDED, isHostedOnly: false, requestedBy: CONST.WISE.KYC_REQUIREMENT_REQUESTED_BY.EXPENSIFY, ...overrides};
}

const ENHANCED_DUE_DILIGENCE = [getRequirement(CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO), getRequirement(CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF)];

describe('getWiseOnboardingForm', () => {
    it('adds a page for each requirement Expensify asks for, after the profile pages and in the server order', () => {
        // Given a high-risk business, for which the business page save returned the two source of wealth requirements
        // When the form is built
        const form = getWiseOnboardingForm(ENHANCED_DUE_DILIGENCE);

        // Then the requirement pages follow the profile pages, keyed by Wise's requirement key, which is the step they save under
        expect(form.pages.map((page) => page.key)).toEqual([
            ...PROFILE_PAGE_KEYS,
            CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO,
            CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF,
        ]);
    });

    it.each([
        ['no requirements', undefined],
        [
            'a requirement Wise asked for after Submit',
            [getRequirement(CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF, {requestedBy: CONST.WISE.KYC_REQUIREMENT_REQUESTED_BY.WISE})],
        ],
        ['a requirement only Wise can collect', [getRequirement(CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO, {isHostedOnly: true})]],
        ['a requirement the App has no page for', [getRequirement('BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID')]],
        ['the ID document, which the representative page collects', [getRequirement(CONST.WISE.KYC_REQUIREMENT.ID_DOCUMENT)]],
    ])('keeps only the profile pages for %s', (_label, kycRequirements) => {
        // Given requirements the intake does not draw a page for
        // When the form is built
        const form = getWiseOnboardingForm(kycRequirements);

        // Then the user sees the profile pages alone, since Wise's embedded page collects the rest
        expect(form.pages.map((page) => page.key)).toEqual(PROFILE_PAGE_KEYS);
    });

    it('lets the user pick several sources of funds, out of every value Wise accepts', () => {
        // Given the source of funds page
        const infoPage = getKYCRequirementPage(getRequirement(CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO));
        const field = infoPage?.content.find((item) => 'type' in item && item.key === 'businessSourceOfWealthInfo');

        // Then it is a multiselect over Wise's values, since a company's money can come from more than one source and the server forwards the keys as they are
        expect(field && 'type' in field ? field.type : undefined).toBe('multiselect');
        expect(field && 'values' in field ? (field.values ?? []).map((option) => option.key) : []).toEqual(Object.values(CONST.WISE.SOURCE_OF_WEALTH));
    });
});

describe('getOnboardingStep', () => {
    const form = getWiseOnboardingForm(ENHANCED_DUE_DILIGENCE);

    it('names requirement pages in the URL by keys that differ from their requirement keys', () => {
        // Given the form with both requirement pages
        // When the flow names its pages
        // Then the requirement pages get URL-safe keys, which is why the step is looked up before a save
        expect(getPages(form).map((page) => page.key)).toEqual([...PROFILE_PAGE_KEYS, INFO_ROUTE_KEY, PROOF_ROUTE_KEY]);
    });

    it.each([
        ['a requirement page', INFO_ROUTE_KEY, CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO],
        ['a profile page', 'business', 'business'],
        ['a page the form does not have', 'unknown', 'unknown'],
    ])('saves %s under the key it was built with', (_label, routeKey, expectedStep) => {
        // Given the key the flow gave a page in its URL
        // When the step to save the page under is looked up
        // Then it is the schema key, since the server stores the answers under it and rejects any other step
        expect(getOnboardingStep(form, routeKey)).toBe(expectedStep);
    });
});

describe('getFirstUnansweredRequirementPageKey', () => {
    const form = getWiseOnboardingForm(ENHANCED_DUE_DILIGENCE);

    it('finds the first requirement page with no answer', () => {
        // Given the sources of funds chosen, but no proof uploaded yet
        const answers = {companyRole: CONST.WISE.COMPANY_ROLE.OWNER, businessSourceOfWealthInfo: [CONST.WISE.SOURCE_OF_WEALTH.REVENUE], proofFile: []};

        // When the next requirement page to open is looked up
        // Then it is the proof page, under the key the flow uses in its URL
        expect(getFirstUnansweredRequirementPageKey(form, answers)).toBe(PROOF_ROUTE_KEY);
    });

    it('treats an empty list of sources as no answer', () => {
        // Given no source of funds picked
        // When the next requirement page to open is looked up
        // Then it is the source of funds page
        expect(getFirstUnansweredRequirementPageKey(form, {businessSourceOfWealthInfo: []})).toBe(INFO_ROUTE_KEY);
    });

    it('finds nothing once every requirement page has an answer, or when there are no requirements', () => {
        // Given both requirement pages answered
        const answers = {businessSourceOfWealthInfo: [CONST.WISE.SOURCE_OF_WEALTH.GRANTS, CONST.WISE.SOURCE_OF_WEALTH.DONATIONS], proofFile: [{name: 'proof.pdf', uri: 'file://proof.pdf'}]};

        // When the next requirement page to open is looked up
        // Then there is none, and a form without requirements has none either, even with the profile pages empty
        expect(getFirstUnansweredRequirementPageKey(form, answers)).toBeUndefined();
        expect(getFirstUnansweredRequirementPageKey(getWiseOnboardingForm(undefined), {})).toBeUndefined();
    });
});
