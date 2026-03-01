import CONST from '@src/CONST';
import {getOnboardingFlow, getOnboardingStepCounter} from '@src/libs/getOnboardingStepCounter';
import type {OnboardingFlowContext, OnboardingScreen} from '@src/libs/getOnboardingStepCounter';
import SCREENS from '@src/SCREENS';

const O = SCREENS.ONBOARDING;
const {ONBOARDING_CHOICES, ONBOARDING_SIGNUP_QUALIFIERS} = CONST;

describe('getOnboardingFlow', () => {
    it('returns [ACCOUNTING, INTERESTED_FEATURES] for VSB without domain context', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb'})).toEqual([O.ACCOUNTING, O.INTERESTED_FEATURES]);
    });

    it('returns [EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for SMB without domain context', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb'})).toEqual([O.EMPLOYEES, O.ACCOUNTING, O.INTERESTED_FEATURES]);
    });

    it('returns [PURPOSE, EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([O.PURPOSE, O.EMPLOYEES, O.ACCOUNTING, O.INTERESTED_FEATURES]);
    });

    it('returns [PURPOSE, PERSONAL_DETAILS, WORKSPACE_OPTIONAL] for individual + PERSONAL_SPEND', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND})).toEqual([O.PURPOSE, O.PERSONAL_DETAILS, O.WORKSPACE_OPTIONAL]);
    });

    it('returns [PURPOSE, PERSONAL_DETAILS] for individual + EMPLOYER', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.EMPLOYER})).toEqual([O.PURPOSE, O.PERSONAL_DETAILS]);
    });

    it('returns undefined for individual without purposeSelected', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual'})).toBeUndefined();
    });

    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, ACCOUNTING, INTERESTED_FEATURES] for public + VSB', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true})).toEqual([O.WORK_EMAIL, O.WORK_EMAIL_VALIDATION, O.ACCOUNTING, O.INTERESTED_FEATURES]);
    });

    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for public + SMB', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb', isFromPublicDomain: true})).toEqual([O.WORK_EMAIL, O.WORK_EMAIL_VALIDATION, O.EMPLOYEES, O.ACCOUNTING, O.INTERESTED_FEATURES]);
    });

    it('returns 6-step flow for public + individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            O.WORK_EMAIL,
            O.WORK_EMAIL_VALIDATION,
            O.PURPOSE,
            O.EMPLOYEES,
            O.ACCOUNTING,
            O.INTERESTED_FEATURES,
        ]);
    });

    it('returns 5-step flow for public + individual + PERSONAL_SPEND', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND})).toEqual([
            O.WORK_EMAIL,
            O.WORK_EMAIL_VALIDATION,
            O.PURPOSE,
            O.PERSONAL_DETAILS,
            O.WORKSPACE_OPTIONAL,
        ]);
    });

    it('returns 4-step flow for public + individual + LOOKING_AROUND', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.LOOKING_AROUND})).toEqual([
            O.WORK_EMAIL,
            O.WORK_EMAIL_VALIDATION,
            O.PURPOSE,
            O.PERSONAL_DETAILS,
        ]);
    });

    it('returns 5-step flow for public + merge + VSB', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: false})).toEqual([
            O.WORK_EMAIL,
            O.WORK_EMAIL_VALIDATION,
            O.WORKSPACES,
            O.ACCOUNTING,
            O.INTERESTED_FEATURES,
        ]);
    });

    it('returns 7-step flow for public + merge + individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            O.WORK_EMAIL,
            O.WORK_EMAIL_VALIDATION,
            O.WORKSPACES,
            O.PURPOSE,
            O.EMPLOYEES,
            O.ACCOUNTING,
            O.INTERESTED_FEATURES,
        ]);
    });

    it('returns 6-step flow for public + merge + individual + PERSONAL_SPEND', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND})).toEqual([
            O.WORK_EMAIL,
            O.WORK_EMAIL_VALIDATION,
            O.WORKSPACES,
            O.PURPOSE,
            O.PERSONAL_DETAILS,
            O.WORKSPACE_OPTIONAL,
        ]);
    });

    it('returns 5-step flow for private domain + VSB', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', hasAccessibleDomainPolicies: true})).toEqual([
            O.PERSONAL_DETAILS,
            O.PRIVATE_DOMAIN,
            O.WORKSPACES,
            O.ACCOUNTING,
            O.INTERESTED_FEATURES,
        ]);
    });

    it('returns 6-step flow for private domain + SMB', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb', hasAccessibleDomainPolicies: true})).toEqual([
            O.PERSONAL_DETAILS,
            O.PRIVATE_DOMAIN,
            O.WORKSPACES,
            O.EMPLOYEES,
            O.ACCOUNTING,
            O.INTERESTED_FEATURES,
        ]);
    });

    it('returns 7-step flow for private domain + individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            O.PERSONAL_DETAILS,
            O.PRIVATE_DOMAIN,
            O.WORKSPACES,
            O.PURPOSE,
            O.EMPLOYEES,
            O.ACCOUNTING,
            O.INTERESTED_FEATURES,
        ]);
    });

    it('returns 5-step flow for private domain + individual + PERSONAL_SPEND', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND})).toEqual([
            O.PERSONAL_DETAILS,
            O.PRIVATE_DOMAIN,
            O.WORKSPACES,
            O.PURPOSE,
            O.WORKSPACE_OPTIONAL,
        ]);
    });

    it('returns 4-step flow for private domain + individual + EMPLOYER', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: ONBOARDING_CHOICES.EMPLOYER})).toEqual([
            O.PERSONAL_DETAILS,
            O.PRIVATE_DOMAIN,
            O.WORKSPACES,
            O.PURPOSE,
        ]);
    });
});

describe('getOnboardingStepCounter', () => {
    it('returns correct step/total/percentage for each page in VSB flow', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'vsb'};
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 1, total: 2}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 2, total: 2}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for each page in SMB flow', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'smb'};
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 4}, progressBarPercentage: 25});
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 2, total: 4}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 3, total: 4}, progressBarPercentage: 75});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 4, total: 4}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for individual + PERSONAL_SPEND', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND};
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(O.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(O.WORKSPACE_OPTIONAL, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for individual + other purpose', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.EMPLOYER};
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 2}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(O.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 2, total: 2}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(O.WORK_EMAIL, ctx)).toEqual({stepCounter: {step: 1, total: 6}, progressBarPercentage: 17});
        expect(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx)).toEqual({stepCounter: {step: 2, total: 6}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 3, total: 6}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 4, total: 6}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 5, total: 6}, progressBarPercentage: 83});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 6, total: 6}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + merge + individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(O.WORK_EMAIL, ctx)).toEqual({stepCounter: {step: 1, total: 7}, progressBarPercentage: 14});
        expect(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx)).toEqual({stepCounter: {step: 2, total: 7}, progressBarPercentage: 29});
        expect(getOnboardingStepCounter(O.WORKSPACES, ctx)).toEqual({stepCounter: {step: 3, total: 7}, progressBarPercentage: 43});
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 4, total: 7}, progressBarPercentage: 57});
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 5, total: 7}, progressBarPercentage: 71});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 6, total: 7}, progressBarPercentage: 86});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 7, total: 7}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for private domain + individual + MANAGE_TEAM (7-step flow)', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(O.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 1, total: 7}, progressBarPercentage: 14});
        expect(getOnboardingStepCounter(O.PRIVATE_DOMAIN, ctx)).toEqual({stepCounter: {step: 2, total: 7}, progressBarPercentage: 29});
        expect(getOnboardingStepCounter(O.WORKSPACES, ctx)).toEqual({stepCounter: {step: 3, total: 7}, progressBarPercentage: 43});
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 4, total: 7}, progressBarPercentage: 57});
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 5, total: 7}, progressBarPercentage: 71});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 6, total: 7}, progressBarPercentage: 86});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 7, total: 7}, progressBarPercentage: 100});
    });

    describe('sub-page mappings', () => {
        it.each([
            {label: 'WORKSPACE_CONFIRMATION', page: O.WORKSPACE_CONFIRMATION},
            {label: 'WORKSPACE_CURRENCY', page: O.WORKSPACE_CURRENCY},
            {label: 'WORKSPACE_INVITE', page: O.WORKSPACE_INVITE},
        ])('$label maps to the same step as WORKSPACE_OPTIONAL', ({page}) => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND};
            expect(getOnboardingStepCounter(page, ctx)).toEqual(getOnboardingStepCounter(O.WORKSPACE_OPTIONAL, ctx));
        });

        it('PRIVATE_DOMAIN resolves to WORK_EMAIL_VALIDATION step in public domain flows', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
            expect(getOnboardingStepCounter(O.PRIVATE_DOMAIN, ctx)).toEqual(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx));
        });

        it('PRIVATE_DOMAIN is its own step in private domain flows', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true};
            expect(getOnboardingStepCounter(O.PRIVATE_DOMAIN, ctx)).toBeDefined();
            expect(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx)).toBeUndefined();
        });
    });

    describe('indeterminate flow (no purposeSelected)', () => {
        const domainVariants: Array<{
            label: string;
            ctx: OnboardingFlowContext;
            expectedPurposeStep: number;
            expectedPurposePct: number;
            prefixPages: Array<{page: OnboardingScreen; step: number; pct: number}>;
        }> = [
            {
                label: 'no-domain',
                ctx: {signupQualifier: 'individual'},
                expectedPurposeStep: 1,
                expectedPurposePct: 25,
                prefixPages: [],
            },
            {
                label: 'public',
                ctx: {signupQualifier: 'individual', isFromPublicDomain: true},
                expectedPurposeStep: 3,
                expectedPurposePct: 50,
                prefixPages: [
                    {page: O.WORK_EMAIL, step: 1, pct: 17},
                    {page: O.WORK_EMAIL_VALIDATION, step: 2, pct: 33},
                ],
            },
            {
                label: 'public-merge',
                ctx: {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false},
                expectedPurposeStep: 4,
                expectedPurposePct: 57,
                prefixPages: [
                    {page: O.WORK_EMAIL, step: 1, pct: 14},
                    {page: O.WORK_EMAIL_VALIDATION, step: 2, pct: 29},
                    {page: O.WORKSPACES, step: 3, pct: 43},
                ],
            },
            {
                label: 'private',
                ctx: {signupQualifier: 'individual', hasAccessibleDomainPolicies: true},
                expectedPurposeStep: 4,
                expectedPurposePct: 57,
                prefixPages: [
                    {page: O.PERSONAL_DETAILS, step: 1, pct: 14},
                    {page: O.PRIVATE_DOMAIN, step: 2, pct: 29},
                    {page: O.WORKSPACES, step: 3, pct: 43},
                ],
            },
        ];

        it.each(domainVariants)('$label: PURPOSE returns step $expectedPurposeStep without total', ({ctx, expectedPurposeStep, expectedPurposePct}) => {
            const result = getOnboardingStepCounter(O.PURPOSE, ctx);
            expect(result).toEqual({stepCounter: {step: expectedPurposeStep}, progressBarPercentage: expectedPurposePct});
        });

        it.each(domainVariants)('$label: prefix pages return correct steps without total', ({ctx, prefixPages}) => {
            for (const {page, step, pct} of prefixPages) {
                const result = getOnboardingStepCounter(page, ctx);
                expect(result).toEqual({stepCounter: {step}, progressBarPercentage: pct});
            }
        });

        it('PRIVATE_DOMAIN resolves to WORK_EMAIL_VALIDATION step in indeterminate public merge flow', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false};
            expect(getOnboardingStepCounter(O.PRIVATE_DOMAIN, ctx)).toEqual(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx));
        });
    });

    describe('indeterminate percentages never exceed the next page after purpose selection', () => {
        const domainVariants: Array<{label: string; ctx: Partial<OnboardingFlowContext>}> = [
            {label: 'no-domain', ctx: {}},
            {label: 'public', ctx: {isFromPublicDomain: true}},
            {label: 'public-merge', ctx: {isFromPublicDomain: true, isMergeAccountStepSkipped: false}},
            {label: 'private', ctx: {hasAccessibleDomainPolicies: true}},
        ];

        it.each(domainVariants)('$label: PURPOSE indeterminate % ≤ min next-page % across all purposes', ({ctx}) => {
            const indeterminateCtx: OnboardingFlowContext = {signupQualifier: 'individual', ...ctx};
            const purposeResult = getOnboardingStepCounter(O.PURPOSE, indeterminateCtx);
            expect(purposeResult).toBeDefined();

            for (const purpose of Object.values(ONBOARDING_CHOICES)) {
                const flow = getOnboardingFlow({...indeterminateCtx, purposeSelected: purpose});
                if (!flow) {
                    continue;
                }
                const purposeIndex = flow.indexOf(O.PURPOSE);
                if (purposeIndex === -1 || purposeIndex >= flow.length - 1) {
                    continue;
                }
                const nextPage = flow.at(purposeIndex + 1);
                if (!nextPage) {
                    continue;
                }
                const nextResult = getOnboardingStepCounter(nextPage, {...indeterminateCtx, purposeSelected: purpose});
                expect(nextResult).toBeDefined();
                expect(nextResult?.progressBarPercentage).toBeGreaterThanOrEqual(purposeResult?.progressBarPercentage ?? 0);
            }
        });
    });

    it('returns undefined for a page that is not in the flow', () => {
        expect(getOnboardingStepCounter(O.PURPOSE, {signupQualifier: 'vsb'})).toBeUndefined();
    });

    describe('every purpose/qualifier combination produces a defined flow', () => {
        const domainVariants: OnboardingFlowContext[] = [{}, {isFromPublicDomain: true}, {isFromPublicDomain: true, isMergeAccountStepSkipped: false}, {hasAccessibleDomainPolicies: true}];

        it.each(Object.values(ONBOARDING_CHOICES))('individual + %s returns a defined flow across all domain variants', (purpose) => {
            for (const domain of domainVariants) {
                const flow = getOnboardingFlow({signupQualifier: 'individual', purposeSelected: purpose, ...domain});
                expect(flow).toBeDefined();
                expect(flow?.length).toBeGreaterThanOrEqual(1);
            }
        });

        it.each(Object.values(ONBOARDING_SIGNUP_QUALIFIERS))('%s qualifier returns a defined flow across all domain variants', (qualifier) => {
            for (const domain of domainVariants) {
                if (qualifier === 'individual') {
                    expect(getOnboardingFlow({signupQualifier: qualifier, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM, ...domain})).toBeDefined();
                } else {
                    expect(getOnboardingFlow({signupQualifier: qualifier, ...domain})).toBeDefined();
                }
            }
        });
    });
});
