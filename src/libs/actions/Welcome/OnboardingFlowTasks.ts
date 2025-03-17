import type {ValueOf} from 'type-fest';
import type {Video} from '@libs/actions/Report';
import {translateLocal} from '@libs/Localize';
import CONST from '@src/CONST';
import type {OnboardingPurpose} from '@src/CONST';

type OnboardingTask = {
    type: string;
    autoCompleted: boolean;
    mediaAttributes: Record<string, string>;
    title:
        | string
        | ((
              params: Partial<{
                  integrationName: string;
                  workspaceSettingsLink: string;
              }>,
          ) => string);
    description:
        | string
        | ((
              params: Partial<{
                  adminsRoomLink: string;
                  workspaceCategoriesLink: string;
                  workspaceMoreFeaturesLink: string;
                  workspaceMembersLink: string;
                  integrationName: string;
                  workspaceAccountingLink: string;
                  workspaceSettingsLink: string;
                  navatticURL: string;
              }>,
          ) => string);
};

type OnboardingMessage = {
    /** Text message that will be displayed first */
    message: string;

    /** Video object to be displayed after initial description message */
    video?: Video;

    /** List of tasks connected with the message, they will have a checkbox and a separate report for more information */
    tasks: OnboardingTask[];

    /** Type of task described in a string format */
    type?: string;
};

const getOnboardingMessages = () => {
    const selfGuidedTourTask: OnboardingTask = {
        type: 'viewTour',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.selfGuidedTourTask.title'),
        description: ({navatticURL}) => translateLocal('onboarding.tasks.selfGuidedTourTask.description', {navatticURL}),
    };

    const createWorkspaceTask: OnboardingTask = {
        type: 'createWorkspace',
        autoCompleted: true,
        mediaAttributes: {},
        title: ({workspaceSettingsLink}) => `Create a [workspace](${workspaceSettingsLink})`,
        description: ({workspaceSettingsLink}) => translateLocal('onboarding.tasks.createWorkspaceTask.description', {workspaceSettingsLink}),
    };

    const meetGuideTask: OnboardingTask = {
        type: 'meetGuide',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.meetGuideTask.title'),
        description: ({adminsRoomLink}) => translateLocal('onboarding.tasks.meetGuideTask.description', {adminsRoomLink}),
    };

    const setupCategoriesTask: OnboardingTask = {
        type: 'setupCategories',
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4`]: `data-expensify-thumbnail-url="${CLOUDFRONT_URL}/images/walkthrough-categories.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: translateLocal('onboarding.tasks.setupCategoriesTask.title'),
        description: ({workspaceCategoriesLink}) => translateLocal('onboarding.tasks.setupCategoriesTask.description', {workspaceCategoriesLink}),
    };

    const submitExpenseAdminTask: OnboardingTask = {
        type: 'submitExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.submitExpenseAdminTask.title'),
        description: translateLocal('onboarding.tasks.submitExpenseAdminTask.description'),
    };
    const submitExpenseEmployerTask: OnboardingTask = {
        type: 'submitExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.submitExpenseEmployerTask.title'),
        description: translateLocal('onboarding.tasks.submitExpenseEmployerTask.description'),
    };

    const trackExpenseTask: OnboardingTask = {
        type: 'trackExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.trackExpenseTask.title'),
        description: translateLocal('onboarding.tasks.trackExpenseTask.description'),
    };

    const setupCategoriesAndTagsTask: OnboardingTask = {
        type: 'setupCategoriesAndTags',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.setupCategoriesAndTagsTask.title'),
        description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
            translateLocal('onboarding.tasks.setupCategoriesAndTagsTask.description', {workspaceCategoriesLink, workspaceAccountingLink}),
    };

    const setupTagsTask: OnboardingTask = {
        type: 'setupTags',
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-tags.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: translateLocal('onboarding.tasks.setupTagsTask.title'),
        description: ({workspaceMoreFeaturesLink}) => translateLocal('onboarding.tasks.setupTagsTask.description', {workspaceMoreFeaturesLink}),
    };
    const addExpenseApprovalsTask: OnboardingTask = {
        type: 'addExpenseApprovals',
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-approvals-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-approvals.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: translateLocal('onboarding.tasks.addExpenseApprovalsTask.title'),
        description: ({workspaceMoreFeaturesLink}) => translateLocal('onboarding.tasks.addExpenseApprovalsTask.description', {workspaceMoreFeaturesLink}),
    };
    const inviteTeamTask: OnboardingTask = {
        type: 'inviteTeam',
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-invite_members.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: translateLocal('onboarding.tasks.inviteTeamTask.title'),
        description: ({workspaceMembersLink}) => translateLocal('onboarding.tasks.inviteTeamTask.description', {workspaceMembersLink}),
    };

    const addAccountingIntegrationTask: OnboardingTask = {
        type: 'addAccountingIntegration',
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/${
                CONST.CONNECTIONS_VIDEO_PATHS[CONST.ONBOARDING_ACCOUNTING_MAPPING.netsuite]
            }`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_netsuite.png" data-expensify-width="1920" data-expensify-height="1080"`,
            [`${CONST.CLOUDFRONT_URL}/${
                CONST.CONNECTIONS_VIDEO_PATHS[CONST.ONBOARDING_ACCOUNTING_MAPPING.quickbooksOnline]
            }`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_qbo.png" data-expensify-width="1920" data-expensify-height="1080"`,
            [`${CONST.CLOUDFRONT_URL}/${
                CONST.CONNECTIONS_VIDEO_PATHS[CONST.ONBOARDING_ACCOUNTING_MAPPING.xero]
            }`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_xero.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: ({integrationName}) => translateLocal('onboarding.tasks.addAccountingIntegrationTask.title', {integrationName}),
        description: ({integrationName, workspaceAccountingLink}) => translateLocal('onboarding.tasks.addAccountingIntegrationTask.description', {integrationName, workspaceAccountingLink}),
    };
    const inviteAccountantTask: OnboardingTask = {
        type: 'inviteAccountant',
        autoCompleted: false,
        mediaAttributes: {},
        title: translateLocal('onboarding.tasks.inviteAccountantTask.title'),
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
        title: translateLocal('onboarding.tasks.reviewWorkspaceSettingsTask.title'),
        description: translateLocal('onboarding.tasks.reviewWorkspaceSettingsTask.description'),
    };

    const onboardingEmployerOrSubmitMessage: OnboardingMessage = {
        message: translateLocal('onboarding.messages.employerOrSubmitMessage'),
        tasks: [selfGuidedTourTask, submitExpenseEmployerTask],
    };

    const combinedTrackSubmitOnboardingEmployerOrSubmitMessage: OnboardingMessage = {
        ...onboardingEmployerOrSubmitMessage,
        tasks: [selfGuidedTourTask, submitExpenseEmployerTask],
    };

    const onboardingPersonalSpendMessage: OnboardingMessage = {
        message: translateLocal('onboarding.messages.personalSpendMessage'),

        tasks: [selfGuidedTourTask, trackExpenseTask],
    };
    const combinedTrackSubmitOnboardingPersonalSpendMessage: OnboardingMessage = {
        ...onboardingPersonalSpendMessage,
        tasks: [selfGuidedTourTask, trackExpenseTask],
    };
    return {
        ONBOARDING_MESSAGES: {
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: onboardingEmployerOrSubmitMessage,
            [CONST.ONBOARDING_CHOICES.SUBMIT]: onboardingEmployerOrSubmitMessage,
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: {
                message: translateLocal('onboarding.messages.manageTeamMessage'),
                tasks: [
                    createWorkspaceTask,
                    selfGuidedTourTask,
                    meetGuideTask,
                    setupCategoriesAndTagsTask,
                    setupCategoriesTask,
                    setupTagsTask,
                    addExpenseApprovalsTask,
                    inviteTeamTask,
                    addAccountingIntegrationTask,
                ],
            },
            [CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE]: {
                message: translateLocal('onboarding.messages.trackWorkspaceMessage'),
                video: {
                    url: `${CONST.CLOUDFRONT_URL}/videos/guided-setup-manage-team-v2.mp4`,
                    thumbnailUrl: `${CONST.CLOUDFRONT_URL}/images/guided-setup-manage-team.jpg`,
                    duration: 55,
                    width: 1280,
                    height: 960,
                },
                tasks: [createWorkspaceTask, meetGuideTask, setupCategoriesTask, inviteAccountantTask],
            },
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: onboardingPersonalSpendMessage,
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: {
                message: translateLocal('onboarding.messages.chatSplitMessage'),
                tasks: [selfGuidedTourTask, startChatTask, splitExpenseTask],
            },
            [CONST.ONBOARDING_CHOICES.ADMIN]: {
                message: translateLocal('onboarding.messages.adminMessage'),
                tasks: [meetGuideTask, submitExpenseAdminTask, reviewWorkspaceSettingsTask],
            },
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: {
                message: translateLocal('onboarding.messages.lookingAround'),
                tasks: [],
            },
        } satisfies Record<OnboardingPurpose, OnboardingMessage>,

        CREATE_EXPENSE_ONBOARDING_MESSAGES: {
            [CONST.CREATE_EXPENSE_ONBOARDING_CHOICES.PERSONAL_SPEND]: combinedTrackSubmitOnboardingPersonalSpendMessage,
            [CONST.CREATE_EXPENSE_ONBOARDING_CHOICES.EMPLOYER]: combinedTrackSubmitOnboardingEmployerOrSubmitMessage,
            [CONST.CREATE_EXPENSE_ONBOARDING_CHOICES.SUBMIT]: combinedTrackSubmitOnboardingEmployerOrSubmitMessage,
        } satisfies Record<ValueOf<typeof CONST.CREATE_EXPENSE_ONBOARDING_CHOICES>, OnboardingMessage>,
    };
};

export default getOnboardingMessages;
