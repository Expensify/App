import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {translate} from '@libs/Localize';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type {Video} from '@userActions/Report';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import type {Locale, Onboarding} from '@src/types/onyx';

type OnboardingCompanySize = ValueOf<typeof CONST.ONBOARDING_COMPANY_SIZE>;
type OnboardingPurpose = ValueOf<typeof CONST.ONBOARDING_CHOICES>;

type GetOnboardingInitialPathParamsType = {
    isUserFromPublicDomain: boolean;
    hasAccessiblePolicies: boolean;
    onboardingValuesParam?: Onboarding;
    currentOnboardingPurposeSelected: OnyxEntry<OnboardingPurpose>;
    currentOnboardingCompanySize: OnyxEntry<OnboardingCompanySize>;
    onboardingInitialPath: OnyxEntry<string>;
    onboardingValues: OnyxEntry<Onboarding>;
};

type OnboardingTaskLinks = Partial<{
    onboardingCompanySize: OnboardingCompanySize;
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
    type: ValueOf<typeof CONST.ONBOARDING_TASK_TYPE>;
    autoCompleted: boolean;
    mediaAttributes: Record<string, string>;
    title: string | ((params: OnboardingTaskLinks) => string);
    description: string | ((params: OnboardingTaskLinks) => string);
};

type OnboardingMessage = {
    /** Text message that will be displayed first */
    message: string | ((params: OnboardingTaskLinks) => string);

    /** Video object to be displayed after initial description message */
    video?: Video;

    /** List of tasks connected with the message, they will have a checkbox and a separate report for more information */
    tasks: OnboardingTask[];

    /** Type of task described in a string format */
    type?: string;
};

let onboardingData: OnyxEntry<Onboarding>;

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        if (!value) {
            return;
        }
        onboardingData = value;
    },
});

/**
 * Start a new onboarding flow or continue from the last visited onboarding page.
 */
function startOnboardingFlow(startOnboardingFlowParams: GetOnboardingInitialPathParamsType) {
    const currentRoute = navigationRef.getCurrentRoute();
    const adaptedState = getAdaptedStateFromPath(getOnboardingInitialPath(startOnboardingFlowParams), linkingConfig.config, false);
    const focusedRoute = findFocusedRoute(adaptedState as PartialState<NavigationState<RootNavigatorParamList>>);
    if (focusedRoute?.name === currentRoute?.name) {
        return;
    }
    const rootState = navigationRef.getRootState();
    const rootStateRouteNamesSet = new Set(rootState.routes.map((route) => route.name));
    navigationRef.resetRoot({
        ...rootState,
        ...adaptedState,
        stale: true,
        routes: [...rootState.routes, ...(adaptedState?.routes.filter((route) => !rootStateRouteNamesSet.has(route.name)) ?? [])],
    } as PartialState<NavigationState>);
}

function getOnboardingInitialPath(getOnboardingInitialPathParams: GetOnboardingInitialPathParamsType): string {
    const {
        isUserFromPublicDomain,
        hasAccessiblePolicies,
        onboardingValuesParam,
        currentOnboardingPurposeSelected,
        currentOnboardingCompanySize,
        onboardingInitialPath = '',
        onboardingValues,
    } = getOnboardingInitialPathParams;
    const state = getStateFromPath(onboardingInitialPath, linkingConfig.config);
    const currentOnboardingValues = onboardingValuesParam ?? onboardingValues;
    const isVsb = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    const isIndividual = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL;
    const isCurrentOnboardingPurposeManageTeam = currentOnboardingPurposeSelected === CONST.ONBOARDING_CHOICES.MANAGE_TEAM;

    if (onboardingInitialPath.includes(ROUTES.TEST_DRIVE_MODAL_ROOT.route)) {
        return `/${ROUTES.TEST_DRIVE_MODAL_ROOT.route}`;
    }

    if (isVsb) {
        Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
        Onyx.set(ONYXKEYS.ONBOARDING_COMPANY_SIZE, CONST.ONBOARDING_COMPANY_SIZE.MICRO);
    }
    if (isSmb) {
        Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
    }

    if (isIndividual) {
        Onyx.set(ONYXKEYS.ONBOARDING_CUSTOM_CHOICES, [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND, CONST.ONBOARDING_CHOICES.EMPLOYER, CONST.ONBOARDING_CHOICES.CHAT_SPLIT]);
    }
    if (isUserFromPublicDomain && !onboardingValuesParam?.isMergeAccountStepCompleted) {
        return `/${ROUTES.ONBOARDING_WORK_EMAIL.route}`;
    }

    if (!isUserFromPublicDomain && hasAccessiblePolicies) {
        if (onboardingInitialPath) {
            return onboardingInitialPath;
        }
        return `/${ROUTES.ONBOARDING_PERSONAL_DETAILS.route}`;
    }

    if (isVsb) {
        return `/${ROUTES.ONBOARDING_ACCOUNTING.route}`;
    }
    if (isSmb) {
        return `/${ROUTES.ONBOARDING_EMPLOYEES.route}`;
    }

    if (state?.routes?.at(-1)?.name !== NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR) {
        return `/${ROUTES.ONBOARDING_ROOT.route}`;
    }

    if (onboardingInitialPath.includes(ROUTES.ONBOARDING_EMPLOYEES.route) && currentOnboardingPurposeSelected !== null && !isCurrentOnboardingPurposeManageTeam) {
        return `/${ROUTES.ONBOARDING_PURPOSE.route}`;
    }

    if (
        onboardingInitialPath.includes(ROUTES.ONBOARDING_ACCOUNTING.route) &&
        ((currentOnboardingPurposeSelected !== null && !isCurrentOnboardingPurposeManageTeam) || (currentOnboardingCompanySize === null && currentOnboardingPurposeSelected !== null))
    ) {
        return `/${ROUTES.ONBOARDING_PURPOSE.route}`;
    }

    return onboardingInitialPath;
}

const getOnboardingMessages = (locale?: Locale) => {
    const resolvedLocale = locale ?? IntlStore.getCurrentLocale();
    const testDrive = {
        ONBOARDING_TASK_NAME: translate(resolvedLocale, 'onboarding.testDrive.name', {}),
        EMBEDDED_DEMO_WHITELIST: ['http://', 'https://', 'about:'] as string[],
        EMBEDDED_DEMO_IFRAME_TITLE: translate(resolvedLocale, 'onboarding.testDrive.embeddedDemoIframeTitle'),
        EMPLOYEE_FAKE_RECEIPT: {
            AMOUNT: 2000,
            CURRENCY: 'USD',
            DESCRIPTION: translate(resolvedLocale, 'onboarding.testDrive.employeeFakeReceipt.description'),
            MERCHANT: "Tommy's Tires",
        },
    };
    const addExpenseApprovalsTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.ADD_EXPENSE_APPROVALS,
        autoCompleted: false,
        title: () => translate(resolvedLocale, 'onboarding.tasks.addExpenseApprovalsTask.title'),
        description: ({workspaceMoreFeaturesLink}) => translate(resolvedLocale, 'onboarding.tasks.addExpenseApprovalsTask.description', {workspaceMoreFeaturesLink}),
        mediaAttributes: {},
    };
    const createReportTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.CREATE_REPORT,
        autoCompleted: false,
        mediaAttributes: {},
        title: translate(resolvedLocale, 'onboarding.tasks.createReportTask.title'),
        description: translate(resolvedLocale, 'onboarding.tasks.createReportTask.description'),
    };
    const testDriveAdminTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR,
        autoCompleted: false,
        mediaAttributes: {},
        title: ({testDriveURL}) => translate(resolvedLocale, 'onboarding.tasks.testDriveAdminTask.title', {testDriveURL}),
        description: ({testDriveURL}) => translate(resolvedLocale, 'onboarding.tasks.testDriveAdminTask.description', {testDriveURL}),
    };
    const testDriveEmployeeTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR,
        autoCompleted: false,
        mediaAttributes: {},
        title: ({testDriveURL}) => translate(resolvedLocale, 'onboarding.tasks.testDriveEmployeeTask.title', {testDriveURL}),
        description: ({testDriveURL}) => translate(resolvedLocale, 'onboarding.tasks.testDriveEmployeeTask.description', {testDriveURL}),
    };
    const createTestDriveAdminWorkspaceTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.CREATE_WORKSPACE,
        autoCompleted: false,
        mediaAttributes: {},
        title: ({workspaceConfirmationLink}) => translate(resolvedLocale, 'onboarding.tasks.createTestDriveAdminWorkspaceTask.title', {workspaceConfirmationLink}),
        description: translate(resolvedLocale, 'onboarding.tasks.createTestDriveAdminWorkspaceTask.description'),
    };

    const createWorkspaceTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.CREATE_WORKSPACE,
        autoCompleted: true,
        mediaAttributes: {},
        title: ({workspaceSettingsLink}) => translate(resolvedLocale, 'onboarding.tasks.createWorkspaceTask.title', {workspaceSettingsLink}),
        description: ({workspaceSettingsLink}) => translate(resolvedLocale, 'onboarding.tasks.createWorkspaceTask.description', {workspaceSettingsLink}),
    };

    const setupCategoriesTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES,
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-categories.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: ({workspaceCategoriesLink}) => translate(resolvedLocale, 'onboarding.tasks.setupCategoriesTask.title', {workspaceCategoriesLink}),
        description: ({workspaceCategoriesLink}) => translate(resolvedLocale, 'onboarding.tasks.setupCategoriesTask.description', {workspaceCategoriesLink}),
    };

    const combinedTrackSubmitExpenseTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.SUBMIT_EXPENSE,
        autoCompleted: false,
        mediaAttributes: {},
        title: translate(resolvedLocale, 'onboarding.tasks.combinedTrackSubmitExpenseTask.title'),
        description: translate(resolvedLocale, 'onboarding.tasks.combinedTrackSubmitExpenseTask.description'),
    };

    const adminSubmitExpenseTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.SUBMIT_EXPENSE,
        autoCompleted: false,
        mediaAttributes: {},
        title: translate(resolvedLocale, 'onboarding.tasks.adminSubmitExpenseTask.title'),
        description: translate(resolvedLocale, 'onboarding.tasks.adminSubmitExpenseTask.description'),
    };

    const trackExpenseTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.TRACK_EXPENSE,
        autoCompleted: false,
        mediaAttributes: {},
        title: translate(resolvedLocale, 'onboarding.tasks.trackExpenseTask.title'),
        description: translate(resolvedLocale, 'onboarding.tasks.trackExpenseTask.description'),
    };

    const addAccountingIntegrationTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.ADD_ACCOUNTING_INTEGRATION,
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[CONST.ONBOARDING_ACCOUNTING_MAPPING.netsuite]}`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_netsuite.png" data-expensify-width="1920" data-expensify-height="1080"`,
            [`${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[CONST.ONBOARDING_ACCOUNTING_MAPPING.quickbooksOnline]}`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_qbo.png" data-expensify-width="1920" data-expensify-height="1080"`,
            [`${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[CONST.ONBOARDING_ACCOUNTING_MAPPING.xero]}`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_xero.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: ({integrationName, workspaceAccountingLink}) => translate(resolvedLocale, 'onboarding.tasks.addAccountingIntegrationTask.title', {integrationName, workspaceAccountingLink}),
        description: ({integrationName, workspaceAccountingLink}) =>
            translate(resolvedLocale, 'onboarding.tasks.addAccountingIntegrationTask.description', {integrationName, workspaceAccountingLink}),
    };

    const connectCorporateCardTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.CONNECT_CORPORATE_CARD,
        title: ({corporateCardLink}) => translate(resolvedLocale, 'onboarding.tasks.connectCorporateCardTask.title', {corporateCardLink}),
        description: ({corporateCardLink}) => translate(resolvedLocale, 'onboarding.tasks.connectCorporateCardTask.description', {corporateCardLink}),
        autoCompleted: false,
        mediaAttributes: {},
    };

    const inviteTeamTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.INVITE_TEAM,
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-invite_members.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: ({workspaceMembersLink}) => translate(resolvedLocale, 'onboarding.tasks.inviteTeamTask.title', {workspaceMembersLink}),
        description: ({workspaceMembersLink}) => translate(resolvedLocale, 'onboarding.tasks.inviteTeamTask.description', {workspaceMembersLink}),
    };

    const setupCategoriesAndTags: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES_AND_TAGS,
        autoCompleted: false,
        mediaAttributes: {},
        title: ({workspaceCategoriesLink, workspaceTagsLink}) => translate(resolvedLocale, 'onboarding.tasks.setupCategoriesAndTags.title', {workspaceCategoriesLink, workspaceTagsLink}),
        description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
            translate(resolvedLocale, 'onboarding.tasks.setupCategoriesAndTags.description', {workspaceCategoriesLink, workspaceAccountingLink}),
    };
    const setupTagsTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.SETUP_TAGS,
        autoCompleted: false,
        title: ({workspaceTagsLink}) => translate(resolvedLocale, 'onboarding.tasks.setupTagsTask.title', {workspaceTagsLink}),
        description: ({workspaceMoreFeaturesLink}) => translate(resolvedLocale, 'onboarding.tasks.setupTagsTask.description', {workspaceMoreFeaturesLink}),
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-tags.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
    };

    const startChatTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.START_CHAT,
        autoCompleted: false,
        mediaAttributes: {},
        title: translate(resolvedLocale, 'onboarding.tasks.startChatTask.title'),
        description: translate(resolvedLocale, 'onboarding.tasks.startChatTask.description'),
    };

    const splitExpenseTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.SPLIT_EXPENSE,
        autoCompleted: false,
        mediaAttributes: {},
        title: translate(resolvedLocale, 'onboarding.tasks.splitExpenseTask.title'),
        description: translate(resolvedLocale, 'onboarding.tasks.splitExpenseTask.description'),
    };

    const reviewWorkspaceSettingsTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.REVIEW_WORKSPACE_SETTINGS,
        autoCompleted: false,
        mediaAttributes: {},
        title: ({workspaceSettingsLink}) => translate(resolvedLocale, 'onboarding.tasks.reviewWorkspaceSettingsTask.title', {workspaceSettingsLink}),
        description: ({workspaceSettingsLink}) => translate(resolvedLocale, 'onboarding.tasks.reviewWorkspaceSettingsTask.description', {workspaceSettingsLink}),
    };

    const inviteAccountantTask: OnboardingTask = {
        type: CONST.ONBOARDING_TASK_TYPE.INVITE_ACCOUNTANT,
        autoCompleted: false,
        mediaAttributes: {},
        title: ({workspaceMembersLink}) => translate(resolvedLocale, 'onboarding.tasks.inviteAccountantTask.title', {workspaceMembersLink}),
        description: ({workspaceMembersLink}) => translate(resolvedLocale, 'onboarding.tasks.inviteAccountantTask.description', {workspaceMembersLink}),
    };

    const onboardingEmployerOrSubmitMessage: OnboardingMessage = {
        message: translate(resolvedLocale, 'onboarding.messages.onboardingEmployerOrSubmitMessage'),
        tasks: [testDriveEmployeeTask, adminSubmitExpenseTask],
    };

    const combinedTrackSubmitOnboardingEmployerOrSubmitMessage: OnboardingMessage = {
        ...onboardingEmployerOrSubmitMessage,
        tasks: [testDriveEmployeeTask, combinedTrackSubmitExpenseTask],
    };

    const onboardingPersonalSpendMessage: OnboardingMessage = {
        message: translate(resolvedLocale, 'onboarding.messages.onboardingPersonalSpendMessage'),
        tasks: [testDriveEmployeeTask, trackExpenseTask],
    };
    const combinedTrackSubmitOnboardingPersonalSpendMessage: OnboardingMessage = {
        ...onboardingPersonalSpendMessage,
        tasks: [testDriveEmployeeTask, trackExpenseTask],
    };

    const isOnboardingFlow = hasCompletedGuidedSetupFlowSelector(onboardingData);
    const onboardingManageTeamMessage: OnboardingMessage = {
        message: translate(resolvedLocale, 'onboarding.messages.onboardingManageTeamMessage', {isOnboardingFlow}),
        tasks: [
            createWorkspaceTask,
            testDriveAdminTask,
            addAccountingIntegrationTask,
            connectCorporateCardTask,
            inviteTeamTask,
            setupCategoriesAndTags,
            setupCategoriesTask,
            setupTagsTask,
            addExpenseApprovalsTask,
        ],
    };

    const onboardingTrackWorkspaceMessage: OnboardingMessage = {
        message: translate(resolvedLocale, 'onboarding.messages.onboardingTrackWorkspaceMessage'),
        video: {
            url: `${CONST.CLOUDFRONT_URL}/videos/guided-setup-manage-team-v2.mp4`,
            thumbnailUrl: `${CONST.CLOUDFRONT_URL}/images/guided-setup-manage-team.jpg`,
            duration: 55,
            width: 1280,
            height: 960,
        },
        tasks: [createWorkspaceTask, testDriveAdminTask, createReportTask, setupCategoriesTask, inviteAccountantTask, reviewWorkspaceSettingsTask],
    };

    const onboardingChatSplitMessage: OnboardingMessage = {
        message: translate(resolvedLocale, 'onboarding.messages.onboardingChatSplitMessage'),
        tasks: [testDriveEmployeeTask, startChatTask, splitExpenseTask],
    };

    const onboardingAdminMessage: OnboardingMessage = {
        message: translate(resolvedLocale, 'onboarding.messages.onboardingAdminMessage'),
        tasks: [reviewWorkspaceSettingsTask, adminSubmitExpenseTask],
    };
    // Empty message for LOOKING_AROUND - users will only see the backend welcome message
    const onboardingLookingAroundMessage: OnboardingMessage = {
        message: '',
        tasks: [],
    };

    const onboardingTestDriveReceiverMessage: OnboardingMessage = {
        message: translate(resolvedLocale, 'onboarding.messages.onboardingTestDriveReceiverMessage'),
        tasks: [testDriveAdminTask, createTestDriveAdminWorkspaceTask],
    };

    return {
        onboardingMessages: {
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: onboardingEmployerOrSubmitMessage,
            [CONST.ONBOARDING_CHOICES.SUBMIT]: onboardingEmployerOrSubmitMessage,
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: onboardingManageTeamMessage,
            [CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE]: onboardingTrackWorkspaceMessage,
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: onboardingPersonalSpendMessage,
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: onboardingChatSplitMessage,
            [CONST.ONBOARDING_CHOICES.ADMIN]: onboardingAdminMessage,
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: onboardingLookingAroundMessage,
            [CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER]: onboardingTestDriveReceiverMessage,
        } satisfies Record<OnboardingPurpose, OnboardingMessage>,
        createExpenseOnboardingMessages: {
            [CONST.CREATE_EXPENSE_ONBOARDING_CHOICES.PERSONAL_SPEND]: combinedTrackSubmitOnboardingPersonalSpendMessage,
            [CONST.CREATE_EXPENSE_ONBOARDING_CHOICES.EMPLOYER]: combinedTrackSubmitOnboardingEmployerOrSubmitMessage,
            [CONST.CREATE_EXPENSE_ONBOARDING_CHOICES.SUBMIT]: combinedTrackSubmitOnboardingEmployerOrSubmitMessage,
        } satisfies Record<ValueOf<typeof CONST.CREATE_EXPENSE_ONBOARDING_CHOICES>, OnboardingMessage>,
        testDrive,
    };
};

export type {OnboardingMessage, OnboardingTask, OnboardingTaskLinks, OnboardingPurpose, OnboardingCompanySize, GetOnboardingInitialPathParamsType};
export {getOnboardingInitialPath, startOnboardingFlow, getOnboardingMessages};
