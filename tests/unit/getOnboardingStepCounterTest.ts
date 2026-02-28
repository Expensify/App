import CONST from '@src/CONST';
import {getOnboardingFlow, getOnboardingStepCounter} from '@src/libs/getOnboardingStepCounter';
import type {OnboardingFlowContext} from '@src/libs/getOnboardingStepCounter';

describe('getOnboardingFlow', () => {
    // VSB flows (no policies)
    it('returns [ACCOUNTING, INTERESTED_FEATURES] for VSB without domain context', () => {
        const flow = getOnboardingFlow({signupQualifier: 'vsb'});
        expect(flow).toEqual(['Onboarding_Accounting', 'Onboarding_Interested_Features']);
    });

    // SMB flows (no policies)
    it('returns [EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for SMB without domain context', () => {
        const flow = getOnboardingFlow({signupQualifier: 'smb'});
        expect(flow).toEqual(['Onboarding_Employees', 'Onboarding_Accounting', 'Onboarding_Interested_Features']);
    });

    // Individual + MANAGE_TEAM (no policies)
    it('returns [PURPOSE, EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for individual + MANAGE_TEAM', () => {
        const flow = getOnboardingFlow({signupQualifier: 'individual', purposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
        expect(flow).toEqual(['Onboarding_Purpose', 'Onboarding_Employees', 'Onboarding_Accounting', 'Onboarding_Interested_Features']);
    });

    // Individual + PERSONAL_SPEND (no policies)
    it('returns [PURPOSE, PERSONAL_DETAILS, WORKSPACE_OPTIONAL] for individual + PERSONAL_SPEND', () => {
        const flow = getOnboardingFlow({signupQualifier: 'individual', purposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND});
        expect(flow).toEqual(['Onboarding_Purpose', 'Onboarding_Personal_Details', 'Onboarding_Workspace_Optional']);
    });

    // Individual + other purpose (no policies)
    it('returns [PURPOSE, PERSONAL_DETAILS] for individual + EMPLOYER', () => {
        const flow = getOnboardingFlow({signupQualifier: 'individual', purposeSelected: CONST.ONBOARDING_CHOICES.EMPLOYER});
        expect(flow).toEqual(['Onboarding_Purpose', 'Onboarding_Personal_Details']);
    });

    // Individual + no purpose selected yet
    it('returns undefined for individual without purposeSelected', () => {
        const flow = getOnboardingFlow({signupQualifier: 'individual'});
        expect(flow).toBeUndefined();
    });

    // Public domain + VSB
    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, ACCOUNTING, INTERESTED_FEATURES] for public + VSB', () => {
        const flow = getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true});
        expect(flow).toEqual(['Onboarding_Work_Email', 'Onboarding_Work_Email_Validation', 'Onboarding_Accounting', 'Onboarding_Interested_Features']);
    });

    // Public domain + SMB
    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for public + SMB', () => {
        const flow = getOnboardingFlow({signupQualifier: 'smb', isFromPublicDomain: true});
        expect(flow).toEqual(['Onboarding_Work_Email', 'Onboarding_Work_Email_Validation', 'Onboarding_Employees', 'Onboarding_Accounting', 'Onboarding_Interested_Features']);
    });

    // Public domain + individual + MANAGE_TEAM
    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, PURPOSE, EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for public + individual + MANAGE_TEAM', () => {
        const flow = getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
        expect(flow).toEqual([
            'Onboarding_Work_Email',
            'Onboarding_Work_Email_Validation',
            'Onboarding_Purpose',
            'Onboarding_Employees',
            'Onboarding_Accounting',
            'Onboarding_Interested_Features',
        ]);
    });

    // Public domain + individual + PERSONAL_SPEND
    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, PURPOSE, PERSONAL_DETAILS, WORKSPACE_OPTIONAL] for public + individual + PERSONAL_SPEND', () => {
        const flow = getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND});
        expect(flow).toEqual(['Onboarding_Work_Email', 'Onboarding_Work_Email_Validation', 'Onboarding_Purpose', 'Onboarding_Personal_Details', 'Onboarding_Workspace_Optional']);
    });

    // Public domain + individual + other
    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, PURPOSE, PERSONAL_DETAILS] for public + individual + LOOKING_AROUND', () => {
        const flow = getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: CONST.ONBOARDING_CHOICES.LOOKING_AROUND});
        expect(flow).toEqual(['Onboarding_Work_Email', 'Onboarding_Work_Email_Validation', 'Onboarding_Purpose', 'Onboarding_Personal_Details']);
    });

    // Private domain + VSB
    it('returns [PERSONAL_DETAILS, PRIVATE_DOMAIN, WORKSPACES, ACCOUNTING, INTERESTED_FEATURES] for private domain + VSB', () => {
        const flow = getOnboardingFlow({signupQualifier: 'vsb', hasAccessibleDomainPolicies: true});
        expect(flow).toEqual(['Onboarding_Personal_Details', 'Onboarding_Private_Domain', 'Onboarding_Workspaces', 'Onboarding_Accounting', 'Onboarding_Interested_Features']);
    });

    // Private domain + SMB
    it('returns [PERSONAL_DETAILS, PRIVATE_DOMAIN, WORKSPACES, EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for private domain + SMB', () => {
        const flow = getOnboardingFlow({signupQualifier: 'smb', hasAccessibleDomainPolicies: true});
        expect(flow).toEqual([
            'Onboarding_Personal_Details',
            'Onboarding_Private_Domain',
            'Onboarding_Workspaces',
            'Onboarding_Employees',
            'Onboarding_Accounting',
            'Onboarding_Interested_Features',
        ]);
    });

    // Private domain + individual + MANAGE_TEAM
    it('returns [PERSONAL_DETAILS, PRIVATE_DOMAIN, WORKSPACES, PURPOSE, EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for private domain + individual + MANAGE_TEAM', () => {
        const flow = getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
        expect(flow).toEqual([
            'Onboarding_Personal_Details',
            'Onboarding_Private_Domain',
            'Onboarding_Workspaces',
            'Onboarding_Purpose',
            'Onboarding_Employees',
            'Onboarding_Accounting',
            'Onboarding_Interested_Features',
        ]);
    });

    // Private domain + individual + PERSONAL_SPEND
    it('returns [PERSONAL_DETAILS, PRIVATE_DOMAIN, WORKSPACES, PURPOSE, WORKSPACE_OPTIONAL] for private domain + individual + PERSONAL_SPEND', () => {
        const flow = getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND});
        expect(flow).toEqual(['Onboarding_Personal_Details', 'Onboarding_Private_Domain', 'Onboarding_Workspaces', 'Onboarding_Purpose', 'Onboarding_Workspace_Optional']);
    });

    // Private domain + individual + other
    it('returns [PERSONAL_DETAILS, PRIVATE_DOMAIN, WORKSPACES, PURPOSE] for private domain + individual + EMPLOYER', () => {
        const flow = getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: CONST.ONBOARDING_CHOICES.EMPLOYER});
        expect(flow).toEqual(['Onboarding_Personal_Details', 'Onboarding_Private_Domain', 'Onboarding_Workspaces', 'Onboarding_Purpose']);
    });
});

describe('getOnboardingStepCounter', () => {
    it('returns correct step/total/percentage for each page in VSB flow', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'vsb'};
        expect(getOnboardingStepCounter('Onboarding_Accounting', ctx)).toEqual({stepCounter: {step: 1, total: 2}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter('Onboarding_Interested_Features', ctx)).toEqual({stepCounter: {step: 2, total: 2}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for each page in SMB flow', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'smb'};
        expect(getOnboardingStepCounter('Onboarding_Employees', ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter('Onboarding_Accounting', ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter('Onboarding_Interested_Features', ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter('Onboarding_Purpose', ctx)).toEqual({stepCounter: {step: 1, total: 4}, progressBarPercentage: 25});
        expect(getOnboardingStepCounter('Onboarding_Employees', ctx)).toEqual({stepCounter: {step: 2, total: 4}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter('Onboarding_Accounting', ctx)).toEqual({stepCounter: {step: 3, total: 4}, progressBarPercentage: 75});
        expect(getOnboardingStepCounter('Onboarding_Interested_Features', ctx)).toEqual({stepCounter: {step: 4, total: 4}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for individual + PERSONAL_SPEND', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND};
        expect(getOnboardingStepCounter('Onboarding_Purpose', ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter('Onboarding_Personal_Details', ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter('Onboarding_Workspace_Optional', ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for individual + other purpose', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: CONST.ONBOARDING_CHOICES.EMPLOYER};
        expect(getOnboardingStepCounter('Onboarding_Purpose', ctx)).toEqual({stepCounter: {step: 1, total: 2}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter('Onboarding_Personal_Details', ctx)).toEqual({stepCounter: {step: 2, total: 2}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter('Onboarding_Work_Email', ctx)).toEqual({stepCounter: {step: 1, total: 6}, progressBarPercentage: 17});
        expect(getOnboardingStepCounter('Onboarding_Work_Email_Validation', ctx)).toEqual({stepCounter: {step: 2, total: 6}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter('Onboarding_Purpose', ctx)).toEqual({stepCounter: {step: 3, total: 6}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter('Onboarding_Employees', ctx)).toEqual({stepCounter: {step: 4, total: 6}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter('Onboarding_Accounting', ctx)).toEqual({stepCounter: {step: 5, total: 6}, progressBarPercentage: 83});
        expect(getOnboardingStepCounter('Onboarding_Interested_Features', ctx)).toEqual({stepCounter: {step: 6, total: 6}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for private domain + individual + MANAGE_TEAM (7-step flow)', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter('Onboarding_Personal_Details', ctx)).toEqual({stepCounter: {step: 1, total: 7}, progressBarPercentage: 14});
        expect(getOnboardingStepCounter('Onboarding_Private_Domain', ctx)).toEqual({stepCounter: {step: 2, total: 7}, progressBarPercentage: 29});
        expect(getOnboardingStepCounter('Onboarding_Workspaces', ctx)).toEqual({stepCounter: {step: 3, total: 7}, progressBarPercentage: 43});
        expect(getOnboardingStepCounter('Onboarding_Purpose', ctx)).toEqual({stepCounter: {step: 4, total: 7}, progressBarPercentage: 57});
        expect(getOnboardingStepCounter('Onboarding_Employees', ctx)).toEqual({stepCounter: {step: 5, total: 7}, progressBarPercentage: 71});
        expect(getOnboardingStepCounter('Onboarding_Accounting', ctx)).toEqual({stepCounter: {step: 6, total: 7}, progressBarPercentage: 86});
        expect(getOnboardingStepCounter('Onboarding_Interested_Features', ctx)).toEqual({stepCounter: {step: 7, total: 7}, progressBarPercentage: 100});
    });

    describe('sub-page mappings', () => {
        it('WORKSPACE_CONFIRMATION maps to WORKSPACE_OPTIONAL step', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND};
            const optionalResult = getOnboardingStepCounter('Onboarding_Workspace_Optional', ctx);
            const confirmationResult = getOnboardingStepCounter('Onboarding_Workspace_Confirmation', ctx);
            expect(confirmationResult).toEqual(optionalResult);
        });

        it('WORKSPACE_CURRENCY maps to WORKSPACE_OPTIONAL step', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND};
            const optionalResult = getOnboardingStepCounter('Onboarding_Workspace_Optional', ctx);
            const currencyResult = getOnboardingStepCounter('Onboarding_Workspace_Currency', ctx);
            expect(currencyResult).toEqual(optionalResult);
        });

        it('WORKSPACE_INVITE maps to WORKSPACE_OPTIONAL step', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND};
            const optionalResult = getOnboardingStepCounter('Onboarding_Workspace_Optional', ctx);
            const inviteResult = getOnboardingStepCounter('Onboarding_Workspace_Invite', ctx);
            expect(inviteResult).toEqual(optionalResult);
        });
    });

    describe('WORK_EMAIL_VALIDATION and PRIVATE_DOMAIN are distinct steps', () => {
        it('WORK_EMAIL_VALIDATION is its own step after WORK_EMAIL in public domain flows', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'vsb', isFromPublicDomain: true};
            const workEmailResult = getOnboardingStepCounter('Onboarding_Work_Email', ctx);
            const validationResult = getOnboardingStepCounter('Onboarding_Work_Email_Validation', ctx);
            expect(workEmailResult).toEqual({stepCounter: {step: 1, total: 4}, progressBarPercentage: 25});
            expect(validationResult).toEqual({stepCounter: {step: 2, total: 4}, progressBarPercentage: 50});
        });

        it('PRIVATE_DOMAIN is its own step after PERSONAL_DETAILS in private domain flows', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true};
            const personalDetailsResult = getOnboardingStepCounter('Onboarding_Personal_Details', ctx);
            const privateDomainResult = getOnboardingStepCounter('Onboarding_Private_Domain', ctx);
            expect(personalDetailsResult).toEqual({stepCounter: {step: 1, total: 5}, progressBarPercentage: 20});
            expect(privateDomainResult).toEqual({stepCounter: {step: 2, total: 5}, progressBarPercentage: 40});
        });
    });

    describe('indeterminate flow (no purposeSelected)', () => {
        it('returns stepCounter without total for PURPOSE screen when purpose not yet selected (no domain)', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual'};
            const result = getOnboardingStepCounter('Onboarding_Purpose', ctx);
            expect(result).toBeDefined();
            expect(result?.stepCounter.step).toBe(1);
            expect(result?.stepCounter.total).toBeUndefined();
            expect(result?.progressBarPercentage).toBe(50);
        });

        it('returns stepCounter without total for PURPOSE screen when purpose not yet selected (public domain)', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true};
            const result = getOnboardingStepCounter('Onboarding_Purpose', ctx);
            expect(result).toBeDefined();
            expect(result?.stepCounter.step).toBe(3);
            expect(result?.stepCounter.total).toBeUndefined();
            expect(result?.progressBarPercentage).toBe(75);
        });

        it('returns stepCounter without total for PURPOSE screen when purpose not yet selected (private domain)', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', hasAccessibleDomainPolicies: true};
            const result = getOnboardingStepCounter('Onboarding_Purpose', ctx);
            expect(result).toBeDefined();
            expect(result?.stepCounter.step).toBe(4);
            expect(result?.stepCounter.total).toBeUndefined();
            expect(result?.progressBarPercentage).toBe(80);
        });

        it('returns step 1 without total for WORK_EMAIL when purpose not yet selected (public domain)', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true};
            const result = getOnboardingStepCounter('Onboarding_Work_Email', ctx);
            expect(result).toBeDefined();
            expect(result?.stepCounter.step).toBe(1);
            expect(result?.stepCounter.total).toBeUndefined();
            expect(result?.progressBarPercentage).toBe(25);
        });

        it('returns step 2 without total for WORK_EMAIL_VALIDATION when purpose not yet selected (public domain)', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true};
            const result = getOnboardingStepCounter('Onboarding_Work_Email_Validation', ctx);
            expect(result).toBeDefined();
            expect(result?.stepCounter.step).toBe(2);
            expect(result?.stepCounter.total).toBeUndefined();
            expect(result?.progressBarPercentage).toBe(50);
        });

        it('returns step 1 without total for PERSONAL_DETAILS when purpose not yet selected (private domain)', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', hasAccessibleDomainPolicies: true};
            const result = getOnboardingStepCounter('Onboarding_Personal_Details', ctx);
            expect(result).toBeDefined();
            expect(result?.stepCounter.step).toBe(1);
            expect(result?.stepCounter.total).toBeUndefined();
            expect(result?.progressBarPercentage).toBe(20);
        });

        it('returns step 2 without total for PRIVATE_DOMAIN when purpose not yet selected (private domain)', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', hasAccessibleDomainPolicies: true};
            const result = getOnboardingStepCounter('Onboarding_Private_Domain', ctx);
            expect(result).toBeDefined();
            expect(result?.stepCounter.step).toBe(2);
            expect(result?.stepCounter.total).toBeUndefined();
            expect(result?.progressBarPercentage).toBe(40);
        });

        it('returns step 3 without total for WORKSPACES when purpose not yet selected (private domain)', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', hasAccessibleDomainPolicies: true};
            const result = getOnboardingStepCounter('Onboarding_Workspaces', ctx);
            expect(result).toBeDefined();
            expect(result?.stepCounter.step).toBe(3);
            expect(result?.stepCounter.total).toBeUndefined();
            expect(result?.progressBarPercentage).toBe(60);
        });
    });

    it('returns undefined for a page that is not in the flow', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'vsb'};
        // PURPOSE is not in the VSB flow
        expect(getOnboardingStepCounter('Onboarding_Purpose', ctx)).toBeUndefined();
    });

    describe('every purpose choice produces a defined flow for each qualifier', () => {
        const allPurposes = Object.values(CONST.ONBOARDING_CHOICES);
        const domainVariants: OnboardingFlowContext[] = [{}, {isFromPublicDomain: true}, {hasAccessibleDomainPolicies: true}];

        it.each(allPurposes)('individual + %s returns a defined flow', (purpose) => {
            for (const domain of domainVariants) {
                const flow = getOnboardingFlow({signupQualifier: 'individual', purposeSelected: purpose, ...domain});
                expect(flow).toBeDefined();
                expect(flow?.length).toBeGreaterThanOrEqual(1);
            }
        });

        it.each(Object.values(CONST.ONBOARDING_SIGNUP_QUALIFIERS))('%s qualifier returns a defined flow', (qualifier) => {
            for (const domain of domainVariants) {
                if (qualifier === 'individual') {
                    const flow = getOnboardingFlow({signupQualifier: qualifier, purposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM, ...domain});
                    expect(flow).toBeDefined();
                } else {
                    const flow = getOnboardingFlow({signupQualifier: qualifier, ...domain});
                    expect(flow).toBeDefined();
                }
            }
        });
    });
});
