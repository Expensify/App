import type {DynamicFormValues} from '@components/DynamicForm/types';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';
import {getPages} from '@components/DynamicForm/utils/paginate';

import {getKeptSourceOfFunds, SOURCE_OF_FUNDS_PAGE_KEY} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/forms/requirements/sourceOfFunds';
import getWiseOnboardingForm, {getFirstUnansweredRequirementPageKey, getOnboardingStep} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseOnboardingForm';
import getKYCRequirementPages from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/kycRequirementLayouts';

import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormPage} from '@src/types/onyx';
import type {WiseKYCRequirement} from '@src/types/onyx/WiseKYCReview';

const PROFILE_PAGE_KEYS = ['representative', 'business'];
const INFO_ROUTE_KEY = 'business-source-of-wealth-info';
const FUNDS_ROUTE_KEY = 'business-source-of-funds';
const PROOF_ROUTE_KEY = 'business-source-of-wealth-proof';

function getRequirement(key: string, overrides: Partial<WiseKYCRequirement> = {}): WiseKYCRequirement {
    return {key, state: CONST.WISE.KYC_REQUIREMENT_STATE.NOT_PROVIDED, isHostedOnly: false, requestedBy: CONST.WISE.KYC_REQUIREMENT_REQUESTED_BY.EXPENSIFY, ...overrides};
}

/** A source's documents of one type, as the proof page's upload field stores them */
function getDocumentEntry(documentType: string) {
    return {id: documentType, fileType: documentType, files: [{name: `${documentType}.pdf`, uri: `file://${documentType}.pdf`}]};
}

/** The sources page and the daily operations page, built for the given answers */
function getInfoPages(overrides: Partial<WiseKYCRequirement> = {}, answers: DynamicFormValues = {}): DynamicFormPage[] {
    return getKYCRequirementPages(getRequirement(CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO, overrides), answers);
}

function getField(page: DynamicFormPage | undefined, key: string): DynamicFormField | undefined {
    return getContentFields(page?.content ?? [])
        .filter(isSupportedField)
        .find((field) => field.key === key);
}

function getOptionKeys(field: DynamicFormField | undefined): string[] {
    return field && 'values' in field ? (field.values ?? []).map((option) => option.key) : [];
}

const ENHANCED_DUE_DILIGENCE = [getRequirement(CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO), getRequirement(CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF)];

describe('getWiseOnboardingForm', () => {
    it('adds the pages of each requirement Expensify asks for, after the profile pages and in the server order', () => {
        // Given a high-risk business, for which the business page save returned the two source of wealth requirements
        // When the form is built
        const form = getWiseOnboardingForm(ENHANCED_DUE_DILIGENCE);

        // Then the sources page and the daily operations page follow the profile pages, then the documents page
        expect(form.pages.map((page) => page.key)).toEqual([
            ...PROFILE_PAGE_KEYS,
            CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO,
            SOURCE_OF_FUNDS_PAGE_KEY,
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

    it('lets the user pick several sources, out of every value Wise accepts', () => {
        // Given the sources page
        const field = getField(getInfoPages().at(0), CONST.WISE.SOURCE_OF_WEALTH_INFO_KEY);

        // Then it is a multiselect over Wise's values, since a company's money can come from more than one source and the server forwards the keys as they are
        expect(field?.type).toBe('multiselect');
        expect(getOptionKeys(field)).toEqual(Object.values(CONST.WISE.SOURCE_OF_WEALTH));
    });
});

describe('source of wealth pages built from the requirement attributes', () => {
    const PROOF_ATTRIBUTES = {
        acceptedDocumentTypesBySource: {
            REVENUE: ['TAX_DOCUMENTS', 'AUDITED_FINANCIAL_STATEMENTS', 'BANK_STATEMENT'],
            BUSINESS_LOAN: ['LOAN_AGREEMENT', 'BANK_STATEMENT'],
            DONATIONS: ['DONATION_RECEIPTS', 'CONTRACTS', 'BANK_STATEMENT'],
        },
        sourcesNeedingBankStatement: ['BUSINESS_LOAN', 'DONATIONS'],
    };

    function getProofField(source: string) {
        const [proofPage] = getKYCRequirementPages(getRequirement(CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF, {attributes: PROOF_ATTRIBUTES}), {});
        const field = getField(proofPage, `proofFile-${source}`);
        return field?.type === 'file' ? field : undefined;
    }

    it('offers only the sources Wise accepts', () => {
        // Given Wise accepts two sources
        const attributes = {acceptedValues: [CONST.WISE.SOURCE_OF_WEALTH.REVENUE, CONST.WISE.SOURCE_OF_WEALTH.GRANTS]};

        // When the sources page is built
        const field = getField(getInfoPages({attributes}).at(0), CONST.WISE.SOURCE_OF_WEALTH_INFO_KEY);

        // Then only those two are offered
        expect(getOptionKeys(field)).toEqual([CONST.WISE.SOURCE_OF_WEALTH.REVENUE, CONST.WISE.SOURCE_OF_WEALTH.GRANTS]);
    });

    it('asks which picked sources fund daily operations only when several are picked', () => {
        // Given two picked sources, then one
        const severalSources = {[CONST.WISE.SOURCE_OF_WEALTH_INFO_KEY]: [CONST.WISE.SOURCE_OF_WEALTH.BUSINESS_LOAN, CONST.WISE.SOURCE_OF_WEALTH.REVENUE]};
        const oneSource = {[CONST.WISE.SOURCE_OF_WEALTH_INFO_KEY]: [CONST.WISE.SOURCE_OF_WEALTH.REVENUE]};

        // When the daily operations page is built
        const fundsField = getField(getInfoPages({}, severalSources).at(1), CONST.WISE.SOURCE_OF_FUNDS_KEY);

        // Then it lists only the picked sources, in the order of the sources page, and has nothing to ask for a lone source, which funds daily operations, so the flow skips it
        expect(getOptionKeys(fundsField)).toEqual([CONST.WISE.SOURCE_OF_WEALTH.REVENUE, CONST.WISE.SOURCE_OF_WEALTH.BUSINESS_LOAN]);
        expect(getInfoPages({}, oneSource).at(1)?.content).toEqual([]);
    });

    it('gives a source one button for its documents to pick from, and a separate one for a bank statement it needs besides them', () => {
        // Given revenue, which takes any of its documents, and donations, which take one of theirs and a bank statement
        // When the documents page is built
        const revenueUploads = getProofField(CONST.WISE.SOURCE_OF_WEALTH.REVENUE)?.uploads;
        const donationUploads = getProofField(CONST.WISE.SOURCE_OF_WEALTH.DONATIONS)?.uploads;

        // Then revenue has one button for all its types, and donations have one for their other types and one for the bank statement, which its name describes without a hint
        expect(revenueUploads?.map((upload) => upload.fileTypes.map((option) => option.key))).toEqual([['TAX_DOCUMENTS', 'AUDITED_FINANCIAL_STATEMENTS', 'BANK_STATEMENT']]);
        expect(donationUploads?.map((upload) => upload.fileTypes.map((option) => option.key))).toEqual([['DONATION_RECEIPTS', 'CONTRACTS'], ['BANK_STATEMENT']]);
        expect(donationUploads?.at(1)?.descriptionKey).toBeUndefined();
    });

    it('names a button that takes one document after it, so a source of single documents needs no hint above them', () => {
        // Given a business loan, which takes a loan agreement and a bank statement
        // When the documents page is built
        const [proofPage] = getKYCRequirementPages(getRequirement(CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF, {attributes: PROOF_ATTRIBUTES}), {});
        const loanHeading = proofPage?.content.find((item) => item.key === `${CONST.WISE.SOURCE_OF_WEALTH.BUSINESS_LOAN}-heading`);
        const revenueHeading = proofPage?.content.find((item) => item.key === `${CONST.WISE.SOURCE_OF_WEALTH.REVENUE}-heading`);

        // Then each button names its document, the loan heading has no hint, and revenue, whose button offers a choice, keeps its hint
        expect(getProofField(CONST.WISE.SOURCE_OF_WEALTH.BUSINESS_LOAN)?.uploads?.map((upload) => upload.labelKey)).toEqual([
            'walletPage.wiseOnboarding.sourceOfWealthProof.uploadButtons.LOAN_AGREEMENT',
            'walletPage.wiseOnboarding.sourceOfWealthProof.uploadButtons.BANK_STATEMENT',
        ]);
        expect(loanHeading?.descriptionKey).toBeUndefined();
        expect(revenueHeading?.descriptionKey).toBe('walletPage.wiseOnboarding.sourceOfWealthProof.hints.REVENUE');
    });

    it('offers every document type for a source Wise lists none for, and shows a source while it is picked', () => {
        // Given Wise lists no document types for grants
        // When the documents page is built
        const grantsField = getProofField(CONST.WISE.SOURCE_OF_WEALTH.GRANTS);

        // Then grants offer every type, since Wise accepts any of them, and the section follows the sources page, since Wise needs proof of every picked source
        expect(grantsField?.uploads?.flatMap((upload) => upload.fileTypes.map((option) => option.key))).toEqual(Object.values(CONST.WISE.SOURCE_OF_WEALTH_DOCUMENT_TYPE));
        expect(grantsField?.showWhen).toEqual({key: CONST.WISE.SOURCE_OF_WEALTH_INFO_KEY, equals: [CONST.WISE.SOURCE_OF_WEALTH.GRANTS]});
    });
});

describe('getKeptSourceOfFunds', () => {
    it('keeps the daily operations answers of the sources still picked, and makes a lone source fund daily operations', () => {
        // Given revenue and a loan funding daily operations
        const sourceOfFunds = [CONST.WISE.SOURCE_OF_WEALTH.REVENUE, CONST.WISE.SOURCE_OF_WEALTH.BUSINESS_LOAN];

        // When the picked sources change
        // Then a source no longer picked drops out, and a lone source is the answer, since the daily operations page is skipped for it
        expect(getKeptSourceOfFunds([CONST.WISE.SOURCE_OF_WEALTH.REVENUE, CONST.WISE.SOURCE_OF_WEALTH.GRANTS], sourceOfFunds)).toEqual([CONST.WISE.SOURCE_OF_WEALTH.REVENUE]);
        expect(getKeptSourceOfFunds([CONST.WISE.SOURCE_OF_WEALTH.GRANTS], sourceOfFunds)).toEqual([CONST.WISE.SOURCE_OF_WEALTH.GRANTS]);
    });
});

describe('getOnboardingStep', () => {
    const form = getWiseOnboardingForm(ENHANCED_DUE_DILIGENCE);

    it('names requirement pages in the URL by keys that differ from their requirement keys', () => {
        // Given the form with both requirement pages
        // When the flow names its pages
        // Then the requirement pages get URL-safe keys, which is why the step is looked up before a save
        expect(getPages(form).map((page) => page.key)).toEqual([...PROFILE_PAGE_KEYS, INFO_ROUTE_KEY, FUNDS_ROUTE_KEY, PROOF_ROUTE_KEY]);
    });

    it.each([
        ['a requirement page', INFO_ROUTE_KEY, CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO],
        ['the daily operations page, which shares the sources page step', FUNDS_ROUTE_KEY, CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO],
        ['a profile page', 'business', 'business'],
        ['a page the form does not have', 'unknown', 'unknown'],
    ])('saves %s under the key it was built with', (_label, routeKey, expectedStep) => {
        // Given the key the flow gave a page in its URL
        // When the step to save the page under is looked up
        // Then it is the step the page saves under, since the server stores the answers under it and rejects any other step
        expect(getOnboardingStep(form, routeKey)).toBe(expectedStep);
    });
});

describe('getFirstUnansweredRequirementPageKey', () => {
    const form = getWiseOnboardingForm(ENHANCED_DUE_DILIGENCE);

    it('finds the first requirement page with no answer', () => {
        // Given the sources of funds chosen, but no proof uploaded yet
        const answers = {
            companyRole: CONST.WISE.COMPANY_ROLE.OWNER,
            businessSourceOfWealthInfo: [CONST.WISE.SOURCE_OF_WEALTH.REVENUE],
            [`proofFile-${CONST.WISE.SOURCE_OF_WEALTH.REVENUE}`]: [],
        };

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

    it('finds the proof page while one of the picked sources has no document', () => {
        // Given grants and donations picked, only grants funding daily operations, and a document for grants alone
        const answers = {
            businessSourceOfWealthInfo: [CONST.WISE.SOURCE_OF_WEALTH.GRANTS, CONST.WISE.SOURCE_OF_WEALTH.DONATIONS],
            sourceOfFunds: [CONST.WISE.SOURCE_OF_WEALTH.GRANTS],
            [`proofFile-${CONST.WISE.SOURCE_OF_WEALTH.GRANTS}`]: [getDocumentEntry('GRANT_APPROVAL_LETTER')],
        };

        // When the next requirement page to open is looked up
        // Then it is the proof page, since Wise needs documents for every picked source, funding daily operations or not
        expect(getFirstUnansweredRequirementPageKey(form, answers)).toBe(PROOF_ROUTE_KEY);
    });

    it('finds nothing once every requirement page has an answer, or when there are no requirements', () => {
        // Given both requirement pages answered, with a document for each picked source
        const answers = {
            businessSourceOfWealthInfo: [CONST.WISE.SOURCE_OF_WEALTH.GRANTS, CONST.WISE.SOURCE_OF_WEALTH.DONATIONS],
            [`proofFile-${CONST.WISE.SOURCE_OF_WEALTH.GRANTS}`]: [getDocumentEntry('GRANT_APPROVAL_LETTER')],
            [`proofFile-${CONST.WISE.SOURCE_OF_WEALTH.DONATIONS}`]: [getDocumentEntry('DONATION_RECEIPTS')],
        };

        // When the next requirement page to open is looked up
        // Then there is none, and a form without requirements has none either, even with the profile pages empty
        expect(getFirstUnansweredRequirementPageKey(form, answers)).toBeUndefined();
        expect(getFirstUnansweredRequirementPageKey(getWiseOnboardingForm(undefined), {})).toBeUndefined();
    });
});
