/**
 * Draft-workspace builders kept outside `Policy.ts` so callers that only need them do not import the policy action module, which
 * pulls in `ReportUtils`, `PolicyUtils` and the task action layer and closes an import cycle.
 */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {generateHexadecimalValue} from '@libs/NumberUtils';

import type {OnboardingPurpose} from '@userActions/Welcome/OnboardingFlow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {IntroSelected} from '@src/types/onyx';
import type {CreatableWorkspaceType, CustomUnit} from '@src/types/onyx/Policy';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {PUBLIC_DOMAINS_SET, Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

type PolicyOwner = {
    email: string | undefined;
    accountID: number | undefined;
};

type OptimisticCustomUnits = {
    customUnits: Record<string, CustomUnit>;
    customUnitID: string;
    customUnitRateID: string;
    outputCurrency: string;
};

function getDisplayNameForWorkspace(email: string, userDisplayName: string | undefined, localeTranslate: LocalizedTranslate) {
    const emailParts = email.split('@');
    const domain = emailParts.at(1) ?? '';
    const isSMSDomain = `@${domain}` === CONST.SMS.DOMAIN;
    if (isSMSDomain) {
        return localeTranslate('workspace.new.myGroupWorkspace', {});
    }

    if (!PUBLIC_DOMAINS_SET.has(domain.toLowerCase())) {
        return Str.UCFirst(domain.split('.').at(0) ?? '');
    }

    const displayName = userDisplayName?.trim();
    if (displayName) {
        return Str.UCFirst(displayName);
    }

    const username = emailParts.at(0) ?? '';
    return Str.UCFirst(username);
}

/**
 * Generate a policy name based on an email and the last workspace number.
 */
function generateDefaultWorkspaceName(email: string, displayName: string | undefined, lastWorkspaceNumber: number | undefined, localeTranslate: LocalizedTranslate): string {
    const emailParts = email.split('@');
    if (emailParts?.length !== 2) {
        return '';
    }
    const domain = emailParts.at(1) ?? '';
    const isSMSDomain = `@${domain}` === CONST.SMS.DOMAIN;

    if (isSMSDomain) {
        return localeTranslate('workspace.new.myGroupWorkspace', {workspaceNumber: lastWorkspaceNumber !== undefined ? lastWorkspaceNumber + 1 : undefined});
    }

    const displayNameForWorkspace = getDisplayNameForWorkspace(email, displayName, localeTranslate);

    return localeTranslate('workspace.new.workspaceName', displayNameForWorkspace, lastWorkspaceNumber !== undefined ? lastWorkspaceNumber + 1 : undefined);
}

/**
 * Returns a client generated 16 character hexadecimal value for the policyID
 */
function generatePolicyID(): string {
    return generateHexadecimalValue(16);
}

/**
 * Returns a client generated 13 character hexadecimal value for a custom unit ID
 */
function generateCustomUnitID(): string {
    return generateHexadecimalValue(13);
}

function buildOptimisticDistanceRateCustomUnits(currencyParam: string | undefined): OptimisticCustomUnits {
    const currency = currencyParam || CONST.CURRENCY.USD;
    const customUnitID = generateCustomUnitID();
    const customUnitRateID = generateCustomUnitID();

    const customUnits: Record<string, CustomUnit> = {
        [customUnitID]: {
            customUnitID,
            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
            attributes: {
                unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            },
            rates: {
                [customUnitRateID]: {
                    customUnitRateID,
                    name: CONST.CUSTOM_UNITS.DEFAULT_RATE,
                    rate: CONST.CUSTOM_UNITS.MILEAGE_IRS_RATE * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
                    enabled: true,
                    currency,
                },
            },
        },
    };

    return {
        customUnits,
        customUnitID,
        customUnitRateID,
        outputCurrency: currency,
    };
}

type NewWorkspaceWorkflowsOptions = {
    /** If the workspace type is submit */
    isSubmitWorkspace: boolean;

    /** Explicit pick from the workspace creation feature map, when the flow offers one */
    workflowsFeatureEnabled?: boolean;

    /** The account level onboarding choice, which the server prefers over this creation's choice */
    introSelectedChoice?: OnboardingPurpose;

    /** The choice passed for this creation, only used when the account has no persisted choice */
    engagementChoice?: OnboardingPurpose;
};

/** Onboarding choices the server ships the Workflows feature enabled for */
function isWorkflowsOnboardingChoice(choice: OnboardingPurpose): boolean {
    return choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM || choice === CONST.ONBOARDING_CHOICES.EMPLOYER || choice === CONST.ONBOARDING_CHOICES.LOOKING_AROUND;
}

/**
 * Mirrors how the server resolves the Workflows feature for a new workspace: an explicit feature map pick wins,
 * then submit workspaces, then the account's onboarding choice falling back to this creation's choice.
 */
function shouldEnableWorkflowsByDefaultForNewWorkspace({isSubmitWorkspace, workflowsFeatureEnabled, introSelectedChoice, engagementChoice}: NewWorkspaceWorkflowsOptions): boolean {
    if (workflowsFeatureEnabled !== undefined) {
        return workflowsFeatureEnabled;
    }
    if (isSubmitWorkspace) {
        return true;
    }
    // The account's choice wins whenever it is set, otherwise we fall back to the choice made for this creation
    if (introSelectedChoice) {
        return isWorkflowsOnboardingChoice(introSelectedChoice);
    }
    return !engagementChoice || isWorkflowsOnboardingChoice(engagementChoice);
}

function getApprovalModeForNewWorkspace(
    isSubmitWorkspace: boolean,
    shouldEnableWorkflowsByDefault: boolean,
    engagementChoice?: OnboardingPurpose,
): ValueOf<typeof CONST.POLICY.APPROVAL_MODE> {
    if (isSubmitWorkspace) {
        return CONST.POLICY.APPROVAL_MODE.ADVANCED;
    }
    if (shouldEnableWorkflowsByDefault && engagementChoice !== CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE) {
        return CONST.POLICY.APPROVAL_MODE.BASIC;
    }
    return CONST.POLICY.APPROVAL_MODE.OPTIONAL;
}

type CreateDraftInitialWorkspaceParams = {
    introSelected: OnyxEntry<IntroSelected>;
    workspaceName: string;
    currentUserAccountID: number;
    currentUserEmail: string;
    currency: string | undefined;
    policyID?: string;
    makeMeAdmin?: boolean;
    file?: File;
    type?: CreatableWorkspaceType;
    isAnnualSubscription?: boolean;
};

/**
 * Optimistically creates a Policy Draft for a new workspace
 */
function createDraftInitialWorkspace({
    introSelected,
    workspaceName,
    currentUserAccountID,
    currentUserEmail,
    currency,
    policyID = generatePolicyID(),
    makeMeAdmin = false,
    file,
    type = CONST.POLICY.TYPE.TEAM,
    isAnnualSubscription = false,
}: CreateDraftInitialWorkspaceParams) {
    const {customUnits, outputCurrency} = buildOptimisticDistanceRateCustomUnits(currency);
    const shouldEnableWorkflowsByDefault =
        !introSelected?.choice || introSelected.choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM || introSelected.choice === CONST.ONBOARDING_CHOICES.LOOKING_AROUND;
    const isWorkflowFeatureEnabled = shouldEnableWorkflowsByDefaultForNewWorkspace({isSubmitWorkspace: type === CONST.POLICY.TYPE.SUBMIT, introSelectedChoice: introSelected?.choice});

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_DRAFTS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`,
            value: {
                id: policyID,
                type: type || (isAnnualSubscription ? CONST.POLICY.TYPE.CORPORATE : CONST.POLICY.TYPE.TEAM),
                name: workspaceName,
                role: CONST.POLICY.ROLE.ADMIN,
                owner: currentUserEmail,
                ownerAccountID: currentUserAccountID,
                areCategoriesEnabled: true,
                approver: currentUserEmail,
                areCompanyCardsEnabled: true,
                areExpensifyCardsEnabled: false,
                outputCurrency,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                customUnits,
                makeMeAdmin,
                autoReporting: true,
                autoReportingFrequency: shouldEnableWorkflowsByDefault ? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE : CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                avatarURL: file?.uri ?? null,
                harvesting: {
                    enabled: !shouldEnableWorkflowsByDefault,
                },
                originalFileName: file?.name,
                employeeList: {
                    [currentUserEmail]: {
                        submitsTo: currentUserEmail,
                        email: currentUserEmail,
                        role: CONST.POLICY.ROLE.ADMIN,
                        errors: {},
                    },
                },
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                pendingFields: {
                    autoReporting: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    reimbursementChoice: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                areWorkflowsEnabled: isWorkflowFeatureEnabled,
                defaultBillable: false,
                defaultReimbursable: true,
                disabledFields: {defaultBillable: true, reimbursable: false},
                requiresCategory: true,
            },
        },
    ];

    Onyx.update(optimisticData);
}

export type {PolicyOwner};
export {
    buildOptimisticDistanceRateCustomUnits,
    createDraftInitialWorkspace,
    generateCustomUnitID,
    generateDefaultWorkspaceName,
    generatePolicyID,
    getApprovalModeForNewWorkspace,
    getDisplayNameForWorkspace,
    shouldEnableWorkflowsByDefaultForNewWorkspace,
};
