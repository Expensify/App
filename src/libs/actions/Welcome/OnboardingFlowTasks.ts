import type {ValueOf} from 'type-fest';
import type {Video} from '@libs/actions/Report';
import {translateLocal} from '@libs/Localize';
import CONST from '@src/CONST'
import type {OnboardingPurpose} from '@src/CONST';

type OnboardingTask = {
    type: string;
    autoCompleted: boolean;
    title:
        | string
        | ((
              params: Partial<{
                  integrationName: string;
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

const selfGuidedTourTask: OnboardingTask = {
    type: 'viewTour',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.selfGuidedTourTask.title'),
    description: ({navatticURL}) => translateLocal('onboarding.tasks.selfGuidedTourTask.description', {navatticURL}),
};

const createWorkspaceTask: OnboardingTask = {
    type: 'createWorkspace',
    autoCompleted: true,
    title: translateLocal('onboarding.tasks.createWorkspaceTask.title'),
    description: ({workspaceSettingsLink}) => translateLocal('onboarding.tasks.createWorkspaceTask.description', {workspaceSettingsLink}),
};

const meetGuideTask: OnboardingTask = {
    type: 'meetGuide',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.meetGuideTask.title'),
    description: ({adminsRoomLink}) => translateLocal('onboarding.tasks.meetGuideTask.description', {adminsRoomLink}),
};

const setupCategoriesTask: OnboardingTask = {
    type: 'setupCategories',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.setupCategoriesTask.title'),
    description: ({workspaceCategoriesLink}) => translateLocal('onboarding.tasks.setupCategoriesTask.description', {workspaceCategoriesLink}),
};

const submitExpenseTask: OnboardingTask = {
    type: 'submitExpense',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.submitExpenseTask.title'),
    description: translateLocal('onboarding.tasks.submitExpenseTask.description'),
};

const trackExpenseTask: OnboardingTask = {
    type: 'trackExpense',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.trackExpenseTask.title'),
    description: translateLocal('onboarding.tasks.trackExpenseTask.description'),
};

const setupCategoriesAndTagsTask: OnboardingTask = {
    type: 'setupCategoriesAndTags',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.setupCategoriesAndTagsTask.title'),
    description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
        translateLocal('onboarding.tasks.setupCategoriesAndTagsTask.description', {workspaceCategoriesLink, workspaceAccountingLink}),
};

const setupTagsTask: OnboardingTask = {
    type: 'setupTags',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.setupTagsTask.title'),
    description: ({workspaceMoreFeaturesLink}) => translateLocal('onboarding.tasks.setupTagsTask.description', {workspaceMoreFeaturesLink}),
};
const addExpenseApprovalsTask: OnboardingTask = {
    type: 'addExpenseApprovals',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.addExpenseApprovalsTask.title'),
    description: ({workspaceMoreFeaturesLink}) => translateLocal('onboarding.tasks.addExpenseApprovalsTask.description', {workspaceMoreFeaturesLink}),
};
const inviteTeamTask: OnboardingTask = {
    type: 'inviteTeam',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.inviteTeamTask.title'),
    description: ({workspaceMembersLink}) => translateLocal('onboarding.tasks.inviteTeamTask.description', {workspaceMembersLink}),
};

const addAccountingIntegrationTask: OnboardingTask = {
    type: 'addAccountingIntegration',
    autoCompleted: false,
    title: ({integrationName}) => translateLocal('onboarding.tasks.addAccountingIntegrationTask.title', {integrationName}),
    description: ({integrationName, workspaceAccountingLink}) => translateLocal('onboarding.tasks.addAccountingIntegrationTask.description', {integrationName, workspaceAccountingLink}),
};
const inviteAccountantTask: OnboardingTask = {
    type: 'inviteAccountant',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.inviteAccountantTask.title'),
    description: ({workspaceMembersLink}) => translateLocal('onboarding.tasks.inviteAccountantTask.description', {workspaceMembersLink}),
};

const startChatTask: OnboardingTask = {
    type: 'startChat',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.startChatTask.title'),
    description: translateLocal('onboarding.tasks.startChatTask.description'),
};
const splitExpenseTask: OnboardingTask = {
    type: 'splitExpense',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.splitExpenseTask.title'),
    description: translateLocal('onboarding.tasks.splitExpenseTask.description'),
};

const reviewWorkspaceSettingsTask: OnboardingTask = {
    type: 'reviewWorkspaceSettings',
    autoCompleted: false,
    title: translateLocal('onboarding.tasks.reviewWorkspaceSettingsTask.title'),
    description: translateLocal('onboarding.tasks.reviewWorkspaceSettingsTask.description'),
};

const onboardingEmployerOrSubmitMessage: OnboardingMessage = {
    message: translateLocal('onboarding.messages.employerOrSubmitMessage'),
    tasks: [selfGuidedTourTask, submitExpenseTask],
};

const combinedTrackSubmitOnboardingEmployerOrSubmitMessage: OnboardingMessage = {
    ...onboardingEmployerOrSubmitMessage,
    tasks: [selfGuidedTourTask, submitExpenseTask],
};

const onboardingPersonalSpendMessage: OnboardingMessage = {
    message: translateLocal('onboarding.messages.personalSpendMessage'),

    tasks: [selfGuidedTourTask, trackExpenseTask],
};
const combinedTrackSubmitOnboardingPersonalSpendMessage: OnboardingMessage = {
    ...onboardingPersonalSpendMessage,
    tasks: [selfGuidedTourTask, trackExpenseTask],
};

const getOnboardingMessages = () => {
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
                tasks: [meetGuideTask, submitExpenseTask, reviewWorkspaceSettingsTask],
            },
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: {
                message:translateLocal('onboarding.messages.lookingAround'),
                tasks: [],
            },
        } satisfies Record<OnboardingPurpose, OnboardingMessage>,

        COMBINED_TRACK_SUBMIT_ONBOARDING_MESSAGES: {
            [CONST.COMBINED_TRACK_SUBMIT_ONBOARDING_CHOICES.PERSONAL_SPEND]: combinedTrackSubmitOnboardingPersonalSpendMessage,
            [CONST.COMBINED_TRACK_SUBMIT_ONBOARDING_CHOICES.EMPLOYER]: combinedTrackSubmitOnboardingEmployerOrSubmitMessage,
            [CONST.COMBINED_TRACK_SUBMIT_ONBOARDING_CHOICES.SUBMIT]: combinedTrackSubmitOnboardingEmployerOrSubmitMessage,
        } satisfies Record<ValueOf<typeof CONST.COMBINED_TRACK_SUBMIT_ONBOARDING_CHOICES>, OnboardingMessage>,
    };
};

export default getOnboardingMessages;
