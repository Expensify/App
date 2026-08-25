import type {ONBOARDING_COMPANY_SIZE, ONBOARDING_TASK_TYPE} from '@src/CONST/language/Onboarding';

type ValueOf<T> = T[keyof T];

type OnboardingTaskLinks = Partial<{
    onboardingCompanySize: ValueOf<typeof ONBOARDING_COMPANY_SIZE>;
    integrationName: string;
    workspaceSettingsLink: string;
    workspaceCategoriesLink: string;
    workspaceTagsLink: string;
    workspaceMoreFeaturesLink: string;
    workspaceMembersLink: string;
    workspaceAccountingLink: string;
    workspaceConfirmationLink: string;
    testDriveURL: string;
    corporateCardLink: string;
}>;

type OnboardingTask = {
    type: ValueOf<typeof ONBOARDING_TASK_TYPE>;
    autoCompleted: boolean;
    title: string | ((params: OnboardingTaskLinks) => string);
    description: string | ((params: OnboardingTaskLinks) => string);
};

export type {OnboardingTask, OnboardingTaskLinks};
