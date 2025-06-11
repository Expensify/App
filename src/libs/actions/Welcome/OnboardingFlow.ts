import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {translateLocal} from '@libs/Localize';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import type {Video} from '@userActions/Report';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Onboarding from '@src/types/onyx/Onboarding';

let onboardingInitialPath = '';
const onboardingLastVisitedPathConnection = Onyx.connect({
    key: ONYXKEYS.ONBOARDING_LAST_VISITED_PATH,
    callback: (value) => {
        if (value === undefined) {
            return;
        }
        onboardingInitialPath = value;
        Onyx.disconnect(onboardingLastVisitedPathConnection);
    },
});

let onboardingValues: Onboarding;
Onyx.connect({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        if (value === undefined) {
            return;
        }
        onboardingValues = value;
    },
});

type GetOnboardingInitialPathParamsType = {
    isUserFromPublicDomain: boolean;
    hasAccessiblePolicies: boolean;
    onboardingValuesParam?: Onboarding;
};

type OnboardingCompanySize = ValueOf<typeof CONST.ONBOARDING_COMPANY_SIZE>;
type OnboardingPurpose = ValueOf<typeof CONST.ONBOARDING_CHOICES>;

type OnboardingTaskLinks = Partial<{
    onboardingCompanySize: OnboardingCompanySize;
    integrationName: string;
    workspaceSettingsLink: string;
    workspaceCategoriesLink: string;
    workspaceMoreFeaturesLink: string;
    workspaceMembersLink: string;
    workspaceAccountingLink: string;
    workspaceConfirmationLink: string;
    navatticURL: string;
    testDriveURL: string;
    corporateCardLink: string;
}>;

type OnboardingTask = {
    type: string;
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
    navigationRef.resetRoot({
        ...navigationRef.getRootState(),
        ...adaptedState,
        stale: true,
    } as PartialState<NavigationState>);
}

function getOnboardingInitialPath(getOnboardingInitialPathParams: GetOnboardingInitialPathParamsType): string {
    const {isUserFromPublicDomain, hasAccessiblePolicies, onboardingValuesParam} = getOnboardingInitialPathParams;
    const state = getStateFromPath(onboardingInitialPath, linkingConfig.config);
    const currentOnboardingValues = onboardingValuesParam ?? onboardingValues;
    const isVsb = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    const isIndividual = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL;

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

    return onboardingInitialPath;
}

const getOnboardingMessages = () => {
    const testDrive = {
        ONBOARDING_TASK_NAME: translateLocal('onboarding.testDrive.name', {}),
        EMBEDDED_DEMO_WHITELIST: ['http://', 'https://', 'about:'] as string[],
        EMBEDDED_DEMO_IFRAME_TITLE: translateLocal('onboarding.testDrive.embeddedDemoIframeTitle'),
        EMPLOYEE_FAKE_RECEIPT: {
            AMOUNT: 2000,
            CURRENCY: 'USD',
            DESCRIPTION: translateLocal('onboarding.testDrive.employeeFakeReceipt.description'),
            MERCHANT: "Tommy's Tires",
        },
    };

    const testDriveAdminTask: OnboardingTask = {
        type: 'viewTour',
        autoCompleted: false,
        mediaAttributes: {},
        title: ({testDriveURL}) => translateLocal('onboarding.tasks.testDriveAdminTask.title', {testDriveURL}),
        description: ({testDriveURL}) => translateLocal('onboarding.tasks.testDriveAdminTask.description', {testDriveURL}),
    };
    const testDriveEmployeeTask: OnboardingTask = {
        type: 'viewTour',
        autoCompleted: false,
        mediaAttributes: {},
        title: ({testDriveURL}) => translateLocal('onboarding.tasks.testDriveEmployeeTask.title', {testDriveURL}),
        description: ({testDriveURL}) => translateLocal('onboarding.tasks.testDriveEmployeeTask.description', {testDriveURL}),
    };
    const createTestDriveAdminWorkspaceTask: OnboardingTask = {
        type: 'createWorkspace',
        autoCompleted: false,
        mediaAttributes: {},
        title: ({workspaceConfirmationLink}) => translateLocal('onboarding.tasks.createTestDriveAdminWorkspaceTask.title', {workspaceConfirmationLink}),
        description: translateLocal('onboarding.tasks.createTestDriveAdminWorkspaceTask.description'),
    };

    const createWorkspaceTask: OnboardingTask = {
        type: 'createWorkspace',
        autoCompleted: true,
        mediaAttributes: {},
        title: ({workspaceSettingsLink}) => translateLocal('onboarding.tasks.createWorkspaceTask.title', {workspaceSettingsLink}),
        description: ({workspaceSettingsLink}) => translateLocal('onboarding.tasks.createWorkspaceTask.description', {workspaceSettingsLink}),
    };

    const setupCategoriesTask: OnboardingTask = {
        type: 'setupCategories',
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-categories.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: ({workspaceCategoriesLink}) => translateLocal('onboarding.tasks.setupCategoriesTask.title', {workspaceCategoriesLink}),
        description: ({workspaceCategoriesLink}) => translateLocal('onboarding.tasks.setupCategoriesTask.description', {workspaceCategoriesLink}),
    };

    const combinedTrackSubmitExpenseTask: OnboardingTask = {
        type: 'submitExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.combinedTrackSubmitExpenseTask.title'),
        description: translateLocal('onboarding.tasks.combinedTrackSubmitExpenseTask.description'),
    };

    const adminSubmitExpenseTask: OnboardingTask = {
        type: 'submitExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.adminSubmitExpenseTask.title'),
        description: translateLocal('onboarding.tasks.adminSubmitExpenseTask.description'),
    };

    const trackExpenseTask: OnboardingTask = {
        type: 'trackExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.trackExpenseTask.title'),
        description: translateLocal('onboarding.tasks.trackExpenseTask.description'),
    };

    const addAccountingIntegrationTask: OnboardingTask = {
        type: 'addAccountingIntegration',
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[CONST.ONBOARDING_ACCOUNTING_MAPPING.netsuite]}`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_netsuite.png" data-expensify-width="1920" data-expensify-height="1080"`,
            [`${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[CONST.ONBOARDING_ACCOUNTING_MAPPING.quickbooksOnline]}`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_qbo.png" data-expensify-width="1920" data-expensify-height="1080"`,
            [`${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[CONST.ONBOARDING_ACCOUNTING_MAPPING.xero]}`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_xero.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: ({integrationName, workspaceAccountingLink}) => translateLocal('onboarding.tasks.addAccountingIntegrationTask.title', {integrationName, workspaceAccountingLink}),
        description: ({integrationName, workspaceAccountingLink}) => translateLocal('onboarding.tasks.addAccountingIntegrationTask.description', {integrationName, workspaceAccountingLink}),
    };

    const connectCorporateCardTask: OnboardingTask = {
        type: 'connectCorporateCard',
        title: ({corporateCardLink}) => translateLocal('onboarding.tasks.connectCorporateCardTask.title', {corporateCardLink}),
        description: ({corporateCardLink}) => translateLocal('onboarding.tasks.connectCorporateCardTask.description', {corporateCardLink}),
        autoCompleted: false,
        mediaAttributes: {},
    };

    const inviteTeamTask: OnboardingTask = {
        type: 'inviteTeam',
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-invite_members.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: ({workspaceMembersLink}) => translateLocal('onboarding.tasks.inviteTeamTask.title', {workspaceMembersLink}),
        description: ({workspaceMembersLink}) => translateLocal('onboarding.tasks.inviteTeamTask.description', {workspaceMembersLink}),
    };

    const setupCategoriesAndTags: OnboardingTask = {
        type: 'setupCategoriesAndTags',
        autoCompleted: false,
        mediaAttributes: {},
        title: ({workspaceCategoriesLink, workspaceMoreFeaturesLink}) =>
            translateLocal('onboarding.tasks.setupCategoriesAndTags.title', {workspaceCategoriesLink, workspaceMoreFeaturesLink}),
        description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
            translateLocal('onboarding.tasks.setupCategoriesAndTags.description', {workspaceCategoriesLink, workspaceAccountingLink}),
    };
    const setupTagsTask: OnboardingTask = {
        type: 'setupTags',
        autoCompleted: false,
        title: ({workspaceMoreFeaturesLink}) => translateLocal('onboarding.tasks.setupTagsTask.title', {workspaceMoreFeaturesLink}),
        description: ({workspaceMoreFeaturesLink}) => translateLocal('onboarding.tasks.setupTagsTask.description', {workspaceMoreFeaturesLink}),
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-tags.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
    };

    const inviteAccountantTask: OnboardingTask = {
        type: 'inviteAccountant',
        autoCompleted: false,
        mediaAttributes: {},
        title: ({workspaceMembersLink}) => translateLocal('onboarding.tasks.inviteAccountantTask.title', {workspaceMembersLink}),
        description: ({workspaceMembersLink}) => translateLocal('onboarding.tasks.inviteAccountantTask.description', {workspaceMembersLink}),
    };

    const startChatTask: OnboardingTask = {
        type: 'startChat',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.startChatTask.title'),
        description: translateLocal('onboarding.tasks.startChatTask.description'),
    };

    const splitExpenseTask: OnboardingTask = {
        type: 'splitExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.splitExpenseTask.title'),
        description: translateLocal('onboarding.tasks.splitExpenseTask.description'),
    };

    const reviewWorkspaceSettingsTask: OnboardingTask = {
        type: 'reviewWorkspaceSettings',
        autoCompleted: false,
        mediaAttributes: {},
        title: ({workspaceSettingsLink}) => translateLocal('onboarding.tasks.reviewWorkspaceSettingsTask.title', {workspaceSettingsLink}),
        description: ({workspaceSettingsLink}) => translateLocal('onboarding.tasks.reviewWorkspaceSettingsTask.description', {workspaceSettingsLink}),
    };

    const onboardingEmployerOrSubmitMessage: OnboardingMessage = {
        message: translateLocal('onboarding.messages.onboardingEmployerOrSubmitMessage'),
        tasks: [testDriveEmployeeTask, adminSubmitExpenseTask],
    };

    const combinedTrackSubmitOnboardingEmployerOrSubmitMessage: OnboardingMessage = {
        ...onboardingEmployerOrSubmitMessage,
        tasks: [testDriveEmployeeTask, combinedTrackSubmitExpenseTask],
    };

    const onboardingPersonalSpendMessage: OnboardingMessage = {
        message: translateLocal('onboarding.messages.onboardingPersonalSpendMessage'),
        tasks: [testDriveEmployeeTask, trackExpenseTask],
    };
    const combinedTrackSubmitOnboardingPersonalSpendMessage: OnboardingMessage = {
        ...onboardingPersonalSpendMessage,
        tasks: [testDriveEmployeeTask, trackExpenseTask],
    };

    const onboardingMangeTeamMessage: OnboardingMessage = {
        message: ({onboardingCompanySize}) => translateLocal('onboarding.messages.onboardingMangeTeamMessage', {onboardingCompanySize}),
        tasks: [createWorkspaceTask, testDriveAdminTask, addAccountingIntegrationTask, connectCorporateCardTask, inviteTeamTask, setupCategoriesAndTags, setupCategoriesTask, setupTagsTask],
    };

    const onboardingTrackWorkspaceMessage: OnboardingMessage = {
        message: translateLocal('onboarding.messages.onboardingTrackWorkspaceMessage'),
        video: {
            url: `${CONST.CLOUDFRONT_URL}/videos/guided-setup-manage-team-v2.mp4`,
            thumbnailUrl: `${CONST.CLOUDFRONT_URL}/images/guided-setup-manage-team.jpg`,
            duration: 55,
            width: 1280,
            height: 960,
        },
        tasks: [createWorkspaceTask, setupCategoriesTask, inviteAccountantTask],
    };

    const onboardingChatSplitMessage: OnboardingMessage = {
        message: translateLocal('onboarding.messages.onboardingChatSplitMessage'),
        tasks: [testDriveEmployeeTask, startChatTask, splitExpenseTask],
    };

    const onboardingAdminMessage: OnboardingMessage = {
        message: translateLocal('onboarding.messages.onboardingAdminMessage'),
        tasks: [reviewWorkspaceSettingsTask, adminSubmitExpenseTask],
    };
    const onboardingLookingAroundMessage: OnboardingMessage = {
        message: translateLocal('onboarding.messages.onboardingLookingAroundMessage'),
        tasks: [],
    };

    const onboardingTestDriveReceiverMessage: OnboardingMessage = {
        message: translateLocal('onboarding.messages.onboardingTestDriveReceiverMessage'),
        tasks: [testDriveAdminTask, createTestDriveAdminWorkspaceTask],
    };

    return {
        onboardingMessages: {
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: onboardingEmployerOrSubmitMessage,
            [CONST.ONBOARDING_CHOICES.SUBMIT]: onboardingEmployerOrSubmitMessage,
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: onboardingMangeTeamMessage,
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

function clearInitialPath() {
    onboardingInitialPath = '';
}
export type {OnboardingMessage, OnboardingTask, OnboardingTaskLinks, OnboardingPurpose, OnboardingCompanySize};
export {getOnboardingInitialPath, startOnboardingFlow, clearInitialPath, getOnboardingMessages};
