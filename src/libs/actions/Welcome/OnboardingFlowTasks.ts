import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {OnboardingMessage, OnboardingPurpose, OnboardingTask} from '@src/CONST';

const getOnboardingMessages = () => {
    const getTestDriveTaskName = (testDriveURL?: string) => (testDriveURL ? `Take a [test drive](${testDriveURL})` : 'Take a test drive');

    const testDrive = {
        ONBOARDING_TASK_NAME: getTestDriveTaskName(),
        EMBEDDED_DEMO_WHITELIST: ['http://', 'https://', 'about:'] as string[],
        EMBEDDED_DEMO_IFRAME_TITLE: 'Test Drive',
        EMPLOYEE_FAKE_RECEIPT: {
            AMOUNT: 2000,
            CURRENCY: 'USD',
            DESCRIPTION: 'My test drive receipt!',
            MERCHANT: "Tommy's Tires",
        },
    };

    const testDriveAdminTask: OnboardingTask = {
        type: 'viewTour',
        autoCompleted: false,
        mediaAttributes: {},
        title: ({testDriveURL}) => getTestDriveTaskName(testDriveURL),
        description: ({testDriveURL}) => `[Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
    };
    const testDriveEmployeeTask: OnboardingTask = {
        type: 'viewTour',
        autoCompleted: false,
        mediaAttributes: {},
        title: ({testDriveURL}) => getTestDriveTaskName(testDriveURL),
        description: ({testDriveURL}) => `Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
    };
    const createTestDriveAdminWorkspaceTask: OnboardingTask = {
        type: 'createWorkspace',
        autoCompleted: false,
        mediaAttributes: {},
        title: ({workspaceConfirmationLink}) => `[Create](${workspaceConfirmationLink}) a workspace`,
        description: 'Create a workspace and configure the settings with the help of your setup specialist!',
    };

    const createWorkspaceTask: OnboardingTask = {
        type: 'createWorkspace',
        autoCompleted: true,
        mediaAttributes: {},
        title: ({workspaceSettingsLink}) => `Create a [workspace](${workspaceSettingsLink})`,
        description: ({workspaceSettingsLink}) =>
            '*Create a workspace* to track expenses, scan receipts, chat, and more.\n' +
            '\n' +
            '1. Click *Settings*.\n' +
            '2. Click *Workspaces* > *New workspace*.\n' +
            '\n' +
            `*Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).`,
    };

    const setupCategoriesTask: OnboardingTask = {
        type: 'setupCategories',
        autoCompleted: false,
        mediaAttributes: {
            [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-categories.png" data-expensify-width="1920" data-expensify-height="1080"`,
        },
        title: ({workspaceCategoriesLink}) => `Set up [categories](${workspaceCategoriesLink})`,
        description: ({workspaceCategoriesLink}) =>
            '*Set up categories* so your team can code expenses for easy reporting.\n' +
            '\n' +
            '1. Click *Settings*.\n' +
            '2. Go to *Workspaces*.\n' +
            '3. Select your workspace.\n' +
            '4. Click *Categories*.\n' +
            "5. Disable any categories you don't need.\n" +
            '6. Add your own categories in the top right.\n' +
            '\n' +
            `[Take me to workspace category settings](${workspaceCategoriesLink}).\n` +
            '\n' +
            `![Set up categories](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`,
    };

    const combinedTrackSubmitExpenseTask: OnboardingTask = {
        type: 'submitExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: 'Submit an expense',
        description:
            '*Submit an expense* by entering an amount or scanning a receipt.\n' +
            '\n' +
            '1. Click the green *+* button.\n' +
            '2. Choose *Create expense*.\n' +
            '3. Enter an amount or scan a receipt.\n' +
            `4. Add your boss's email or phone number.\n` +
            '5. Click *Create*.\n' +
            '\n' +
            'And you’re done!',
    };

    const adminSubmitExpenseTask: OnboardingTask = {
        type: 'submitExpense',
        autoCompleted: false,
        mediaAttributes: {},
        title: 'Submit an expense',
        description:
            '*Submit an expense* by entering an amount or scanning a receipt.\n' +
            '\n' +
            '1. Click the green *+* button.\n' +
            '2. Choose *Create expense*.\n' +
            '3. Enter an amount or scan a receipt.\n' +
            '4. Confirm details..\n' +
            '5. Click *Create*.\n' +
            '\n' +
            `And you're done!`,
    };

    const onboardingEmployerOrSubmitMessage: OnboardingMessage = {
        message: 'Getting paid back is as easy as sending a message. Let’s go over the basics.',
        tasks: [testDriveEmployeeTask, adminSubmitExpenseTask],
    };

    const combinedTrackSubmitOnboardingEmployerOrSubmitMessage: OnboardingMessage = {
        ...onboardingEmployerOrSubmitMessage,
        tasks: [testDriveEmployeeTask, combinedTrackSubmitExpenseTask],
    };

    const onboardingPersonalSpendMessage: OnboardingMessage = {
        message: 'Here’s how to track your spend in a few clicks.',
        tasks: [
            testDriveEmployeeTask,
            {
                type: 'trackExpense',
                autoCompleted: false,
                mediaAttributes: {},
                title: 'Track an expense',
                description:
                    '*Track an expense* in any currency, whether you have a receipt or not.\n' +
                    '\n' +
                    '1. Click the green *+* button.\n' +
                    '2. Choose *Create expense*.\n' +
                    '3. Enter an amount or scan a receipt.\n' +
                    '4. Choose your *personal* space.\n' +
                    '5. Click *Create*.\n' +
                    '\n' +
                    'And you’re done! Yep, it’s that easy.',
            },
        ],
    };
    const combinedTrackSubmitOnboardingPersonalSpendMessage: OnboardingMessage = {
        ...onboardingPersonalSpendMessage,
        tasks: [
            testDriveEmployeeTask,
            {
                type: 'trackExpense',
                autoCompleted: false,
                mediaAttributes: {},
                title: 'Track an expense',
                description:
                    '*Track an expense* in any currency, whether you have a receipt or not.\n' +
                    '\n' +
                    '1. Click the green *+* button.\n' +
                    '2. Choose *Create expense*.\n' +
                    '3. Enter an amount or scan a receipt.\n' +
                    '4. Choose your *personal* space.\n' +
                    '5. Click *Create*.\n' +
                    '\n' +
                    'And you’re done! Yep, it’s that easy.',
            },
        ],
    };

    const onboardingMangeTeamMesssage: OnboardingMessage = {
        message: ({onboardingCompanySize: companySize}) => `Here is a task list I’d recommend for a company of your size with ${companySize} submitters:`,
        tasks: [
            createWorkspaceTask,
            testDriveAdminTask,
            {
                type: 'addAccountingIntegration',
                autoCompleted: false,
                mediaAttributes: {
                    [`${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[CONST.ONBOARDING_ACCOUNTING_MAPPING.netsuite]}`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_netsuite.png" data-expensify-width="1920" data-expensify-height="1080"`,
                    [`${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[CONST.ONBOARDING_ACCOUNTING_MAPPING.quickbooksOnline]}`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_qbo.png" data-expensify-width="1920" data-expensify-height="1080"`,
                    [`${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[CONST.ONBOARDING_ACCOUNTING_MAPPING.xero]}`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-connect_to_xero.png" data-expensify-width="1920" data-expensify-height="1080"`,
                },
                title: ({integrationName, workspaceAccountingLink}) => `Connect to [${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    `Connect to ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.\n` +
                    '\n' +
                    '1. Click *Settings*.\n' +
                    '2. Go to *Workspaces*.\n' +
                    '3. Select your workspace.\n' +
                    '4. Click *Accounting*.\n' +
                    `5. Find ${integrationName}.\n` +
                    '6. Click *Connect*.\n' +
                    '\n' +
                    `${
                        integrationName && CONST.connectionsVideoPaths[integrationName]
                            ? `[Take me to accounting](${workspaceAccountingLink}).\n\n![Connect to ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
                            : `[Take me to accounting](${workspaceAccountingLink}).`
                    }`,
            },
            {
                type: 'connectCorporateCard',
                title: ({corporateCardLink}) => `Connect [your corporate card](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    `Connect your corporate card to automatically import and code expenses.\n` +
                    '\n' +
                    '1. Click *Workspaces*.\n' +
                    '2. Select your workspace.\n' +
                    '3. Click *Corporate cards*.\n' +
                    '4. Follow the prompts to connect your card.\n' +
                    '\n' +
                    `[Take me to connect my corporate card](${corporateCardLink}).`,
                autoCompleted: false,
                mediaAttributes: {},
            },
            {
                type: 'inviteTeam',
                autoCompleted: false,
                mediaAttributes: {
                    [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-invite_members.png" data-expensify-width="1920" data-expensify-height="1080"`,
                },
                title: ({workspaceMembersLink}) => `Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    '*Invite your team* to Expensify so they can start tracking expenses today.\n' +
                    '\n' +
                    '1. Click *Settings*.\n' +
                    '2. Go to *Workspaces*.\n' +
                    '3. Select your workspace.\n' +
                    '4. Click *Members* > *Invite member*.\n' +
                    '5. Enter emails or phone numbers. \n' +
                    '6. Add a custom invite message if you’d like!\n' +
                    '\n' +
                    `[Take me to workspace members](${workspaceMembersLink}).\n` +
                    '\n' +
                    `![Invite your team](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`,
            },
            {
                type: 'setupCategoriesAndTags',
                autoCompleted: false,
                mediaAttributes: {},
                title: ({workspaceCategoriesLink, workspaceMoreFeaturesLink}) => `Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceMoreFeaturesLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    '*Set up categories and tags* so your team can code expenses for easy reporting.\n' +
                    '\n' +
                    `Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).`,
            },
            setupCategoriesTask,
            {
                type: 'setupTags',
                autoCompleted: false,
                title: ({workspaceMoreFeaturesLink}) => `Set up [tags](${workspaceMoreFeaturesLink})`,
                mediaAttributes: {
                    [`${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4`]: `data-expensify-thumbnail-url="${CONST.CLOUDFRONT_URL}/images/walkthrough-tags.png" data-expensify-width="1920" data-expensify-height="1080"`,
                },
                description: ({workspaceMoreFeaturesLink}) =>
                    'Tags can be used if you want more details with every expense. Use tags for projects, clients, locations, departments, and more. If you need multiple levels of tags, you can upgrade to the Control plan.\n' +
                    '\n' +
                    '1. Click *Settings*.\n' +
                    '2. Go to *Workspaces*.\n' +
                    '3. Select your workspace.\n' +
                    '4. Click *More features*.\n' +
                    '5. Enable *Tags*.\n' +
                    '6. Navigate to *Tags* in the workspace editor.\n' +
                    '7. Click *+ Add tag* to make your own.\n' +
                    '\n' +
                    `[Take me to more features](${workspaceMoreFeaturesLink}).\n` +
                    '\n' +
                    `![Set up tags](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`,
            },
        ],
    };

    const onboardingTrakcWorkspaceMessage: OnboardingMessage = {
        message: 'Here are some important tasks to help get your workspace set up.',
        video: {
            url: `${CONST.CLOUDFRONT_URL}/videos/guided-setup-manage-team-v2.mp4`,
            thumbnailUrl: `${CONST.CLOUDFRONT_URL}/images/guided-setup-manage-team.jpg`,
            duration: 55,
            width: 1280,
            height: 960,
        },
        tasks: [
            createWorkspaceTask,
            setupCategoriesTask,
            {
                type: 'inviteAccountant',
                autoCompleted: false,
                mediaAttributes: {},
                title: ({workspaceMembersLink}) => `Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    '*Invite your accountant* to Expensify and share your expenses with them to make tax time easier.\n' +
                    '\n' +
                    '1. Click your profile picture.\n' +
                    '2. Go to *Workspaces*.\n' +
                    '3. Select your workspace.\n' +
                    '4. Click *Members* > Invite member.\n' +
                    '5. Enter their email or phone number.\n' +
                    '6. Add an invite message if you’d like.\n' +
                    '7. You’ll be set as the expense approver. You can change this to any admin once you invite your team.\n' +
                    '\n' +
                    'That’s it, happy expensing! 😄\n' +
                    '\n' +
                    `[View your workspace members](${workspaceMembersLink}).`,
            },
        ],
    };

    const onboardingChatSplitMessage: OnboardingMessage = {
        message: 'Splitting bills with friends is as easy as sending a message. Here’s how.',
        tasks: [
            testDriveEmployeeTask,
            {
                type: 'startChat',
                autoCompleted: false,
                mediaAttributes: {},
                title: 'Start a chat',
                description:
                    '*Start a chat* with a friend or group using their email or phone number.\n' +
                    '\n' +
                    '1. Click the green *+* button.\n' +
                    '2. Choose *Start chat*.\n' +
                    '3. Enter emails or phone numbers.\n' +
                    '\n' +
                    'If any of your friends aren’t using Expensify already, they’ll be invited automatically.\n' +
                    '\n' +
                    'Every chat will also turn into an email or text that they can respond to directly.',
            },
            {
                type: 'splitExpense',
                autoCompleted: false,
                mediaAttributes: {},
                title: 'Split an expense',
                description:
                    '*Split an expense* right in your chat with one or more friends.\n' +
                    '\n' +
                    '1. Click the green *+* button.\n' +
                    '2. Choose *Start chat*.\n' +
                    '3. Enter any email, SMS, or name of who you want to split with.\n' +
                    '4. From within the chat, click the *+* button on the message bar, and click *Split expense*.\n' +
                    '5. Create the expense by selecting *Manual*, *Scan* or *Distance*.\n' +
                    '\n' +
                    'Feel free to add more details if you want, or just send it off. Let’s get you paid back!',
            },
        ],
    };

    const onboardingAdminMessage: OnboardingMessage = {
        message: "As an admin, learn how to manage your team's workspace and submit expenses yourself.",
        tasks: [
            {
                type: 'reviewWorkspaceSettings',
                autoCompleted: false,
                mediaAttributes: {},
                title: ({workspaceSettingsLink}) => `Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    "Here's how to review and update your workspace settings:\n" +
                    '1. Click the settings tab.\n' +
                    '2. Click *Workspaces* > [Your workspace].\n' +
                    `[Go to your workspace](${workspaceSettingsLink}). We'll track them in the #admins room.`,
            },
            adminSubmitExpenseTask,
        ],
    };
    const onboardingLookingAroundMessage: OnboardingMessage = {
        message: "Expensify is best known for expense and corporate card management, but we do a lot more than that. Let me know what you're interested in and I'll help get you started.",
        tasks: [],
    };

    const onboardingTestDriveReceiverMessage: OnboardingMessage = {
        message: "*You've got 3 months free! Get started below.*",
        tasks: [testDriveAdminTask, createTestDriveAdminWorkspaceTask],
    };

    return {
        onboardingMessages: {
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: onboardingEmployerOrSubmitMessage,
            [CONST.ONBOARDING_CHOICES.SUBMIT]: onboardingEmployerOrSubmitMessage,
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: onboardingMangeTeamMesssage,
            [CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE]: onboardingTrakcWorkspaceMessage,
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: onboardingPersonalSpendMessage,
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: onboardingChatSplitMessage,
            [CONST.ONBOARDING_CHOICES.ADMIN]: onboardingAdminMessage,
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: onboardingLookingAroundMessage,
            [CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER]: onboardingTestDriveReceiverMessage,
        } satisfies Record<OnboardingPurpose, OnboardingMessage>,
        CREATE_EXPENSE_ONBOARDING_MESSAGES: {
            [CONST.CREATE_EXPENSE_ONBOARDING_CHOICES.PERSONAL_SPEND]: combinedTrackSubmitOnboardingPersonalSpendMessage,
            [CONST.CREATE_EXPENSE_ONBOARDING_CHOICES.EMPLOYER]: combinedTrackSubmitOnboardingEmployerOrSubmitMessage,
            [CONST.CREATE_EXPENSE_ONBOARDING_CHOICES.SUBMIT]: combinedTrackSubmitOnboardingEmployerOrSubmitMessage,
        } satisfies Record<ValueOf<typeof CONST.CREATE_EXPENSE_ONBOARDING_CHOICES>, OnboardingMessage>,
        testDrive,
    };
};

export default getOnboardingMessages;
