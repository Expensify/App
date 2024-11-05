import {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getBrickRoadForPolicy} from '@libs/WorkspacesSettingsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {Report, ReportActions} from '@src/types/onyx';
import {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('WorkspacesSettingsUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });
    describe('getBrickRoadForPolicy', () => {
        it('Should return "error"', async () => {
            const report: Report = {
                isOptimisticReport: false,
                type: 'chat',
                isOwnPolicyExpenseChat: false,
                isPinned: false,
                lastActorAccountID: 0,
                lastMessageTranslationKey: '',
                lastMessageHtml: '',
                lastReadTime: '2024-11-05 11:19:18.288',
                lastVisibleActionCreated: '2024-11-05 11:19:18.288',
                oldPolicyName: '',
                ownerAccountID: 0,
                parentReportActionID: '8722650843049927838',
                parentReportID: '6955627196303088',
                participants: {
                    '18634488': {
                        notificationPreference: 'hidden',
                        role: 'admin',
                    },
                },
                policyID: '57D0F454E0BCE54B',
                reportID: '4286515777714555',
                reportName: 'Expense',
                stateNum: 0,
                statusNum: 0,
                description: '',
                avatarUrl: '',
                avatarFileName: '',
            };

            const MOCK_REPORTS: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}4286515777714555` as const]: report,
                [`${ONYXKEYS.COLLECTION.REPORT}6955627196303088` as const]: {
                    reportID: '6955627196303088',
                    chatReportID: '1699789757771388',
                    policyID: '57D0F454E0BCE54B',
                    type: 'expense',
                    ownerAccountID: 18634488,
                    stateNum: 1,
                    statusNum: 1,
                    parentReportID: '1699789757771388',
                    parentReportActionID: '7978085421707288417',
                },
            };

            const actions: OnyxCollection<ReportActions> = {
                reportActions_1699789757771388: {
                    '4007735288062946397': {
                        reportActionID: '4007735288062946397',
                        actionName: 'CREATED',
                        actorAccountID: 18634488,
                        message: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'You',
                            },
                            {
                                type: 'TEXT',
                                style: 'normal',
                                text: ' created this report',
                            },
                        ],
                        person: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'adasdasd',
                            },
                        ],
                        automatic: false,
                        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
                        created: '2024-11-05 11:10:47.852',
                        shouldShow: true,
                        reportActionTimestamp: 1730805047852,
                        sequenceNumber: 0,
                        lastModified: '2024-11-05 11:10:47.852',
                    },
                    '7978085421707288417': {
                        reportActionID: '7978085421707288417',
                        reportID: '1699789757771388',
                        actionName: 'REPORTPREVIEW',
                        originalMessage: {},
                        message: [
                            {
                                deleted: '',
                                html: "Adasdasd's Workspace owes ₫579",
                                isDeletedParentAction: false,
                                isEdited: false,
                                text: "Adasdasd's Workspace owes ₫579",
                                type: 'COMMENT',
                                whisperedTo: [],
                            },
                        ],
                        created: '2024-11-05 11:19:18.710',
                        accountID: 18634488,
                        actorAccountID: 18634488,
                        childReportID: '6955627196303088',
                        childMoneyRequestCount: 2,
                        childLastMoneyRequestComment: '',
                        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
                        childCommenterCount: 0,
                        childLastActorAccountID: 18634488,

                        childLastVisibleActionCreated: '',
                        childOldestFourAccountIDs: '',
                        childReportNotificationPreference: 'hidden',
                        childType: 'expense',
                        childVisibleActionCount: 0,
                        lastModified: '2024-11-05 11:19:18.710',
                        person: [
                            {
                                style: 'strong',
                                text: 'adasdasd',
                                type: 'TEXT',
                            },
                        ],
                        shouldShow: true,
                        automatic: false,
                        childManagerAccountID: 18634488,
                        childOwnerAccountID: 18634488,
                        childReportName: 'Expense Report #6955627196303088',
                        childStateNum: 1,
                        childStatusNum: 1,

                        reportActionTimestamp: 1730805558710,
                        timestamp: 1730805558,
                        whisperedToAccountIDs: [],
                    },
                },
                reportActions_4148694821839494: {
                    '2964625714811661556': {
                        reportActionID: '2964625714811661556',
                        actionName: 'CREATED',
                        actorAccountID: 18634488,
                        message: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: '_FAKE_',
                            },
                            {
                                type: 'TEXT',
                                style: 'normal',
                                text: ' created this report',
                            },
                        ],
                        person: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'adasdasd',
                            },
                        ],
                        automatic: false,
                        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
                        created: '2024-11-05 11:10:47.077',
                        shouldShow: true,
                    },
                    '5971844472086652538': {
                        actionName: 'ADDCOMMENT',
                        actorAccountID: 10288574,
                        avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/26271df52c9c9db57fa0221feaef04d18a045f2b_128.jpeg',
                        created: '2024-11-05 11:11:47.410',
                        lastModified: '2024-11-05 11:11:47.410',
                        message: [
                            {
                                html: '<h1>Let\'s get you set up on Expensify</h1>Hi there 👋 , I\'m your dedicated setup specialist. I look forward to helping you explore and configure Expensify. A few important things to mention: <br /><ul><li>Your workspace has a ton of custom settings, just select your workspace settings to set it up.</li><li>You\'ve got more functionality to enable, like custom categories, tags, etc. Just ask me how. </li></ul>Chat with me here in your #admins room or just reply to this message. You can also schedule a <a href="https://calendly.com/breanna-sumpter">call</a> if you have more in-depth questions. Talk soon!<br /><br /><img src="https://d2k5nsl2zxldvw.cloudfront.net/images/animations/animation_setupguide.gif" alt="Setup Guide GIF" />',
                                text: "Let's get you set up on Expensify\nHi there 👋 , I'm your dedicated setup specialist. I look forward to helping you explore and configure Expensify. A few important things to mention: \nYour workspace has a ton of custom settings, just select your workspace settings to set it up.You've got more functionality to enable, like custom categories, tags, etc. Just ask me how. Chat with me here in your #admins room or just reply to this message. You can also schedule a call if you have more in-depth questions. Talk soon!\n\n[Attachment]",
                                type: 'COMMENT',
                                whisperedTo: [],
                            },
                        ],
                        originalMessage: {},
                        person: [
                            {
                                style: 'strong',
                                text: 'Setup Specialist - BreAnna Sumpter  Mon-Friday GMT & EST',
                                type: 'TEXT',
                            },
                        ],
                        reportActionID: '5971844472086652538',
                        shouldShow: true,
                    },
                },
                reportActions_4625283659773773: {
                    '7132923952865070123': {
                        actionName: 'ADDCOMMENT',
                        actorAccountID: 8392101,
                        avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/894b50e60056c966d12216005fbcacec8ce5a2c0.png',
                        created: '2024-11-05 11:10:38.956',
                        lastModified: '2024-11-05 11:10:38.956',
                        message: [
                            {
                                type: 'COMMENT',
                                html: "<h1>Welcome to Expensify</h1>👋 Hey there, I'm Concierge! If you have any questions about Expensify, you can always chat with me here 24-7 for fast and reliable support. I'm happy to help!",
                                text: "Welcome to Expensify\n👋 Hey there, I'm Concierge! If you have any questions about Expensify, you can always chat with me here 24-7 for fast and reliable support. I'm happy to help!",
                                isEdited: false,
                                whisperedTo: [],
                                isDeletedParentAction: false,
                                deleted: '',
                            },
                        ],
                        originalMessage: {},
                        person: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'Expensify Concierge',
                            },
                        ],
                        reportActionID: '7132923952865070123',
                        shouldShow: true,
                        timestamp: 1730805038,
                        reportActionTimestamp: 1730805038956,
                        automatic: false,
                        whisperedToAccountIDs: [],
                    },
                    '5686837203726341682': {
                        reportActionID: '5686837203726341682',
                        actionName: 'CREATED',
                        created: '2024-11-05 11:10:38.688',
                        reportActionTimestamp: 1730805038688,
                        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
                        message: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: '__fake__',
                            },
                            {
                                type: 'TEXT',
                                style: 'normal',
                                text: ' created this report',
                            },
                        ],
                        person: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: '__fake__',
                            },
                        ],
                        automatic: false,
                        sequenceNumber: 0,
                        shouldShow: true,
                        lastModified: '2024-11-05 11:10:38.688',
                    },
                    '536505040772198026': {
                        reportActionID: '536505040772198026',
                        actionName: 'ADDCOMMENT',
                        actorAccountID: 8392101,
                        person: [
                            {
                                style: 'strong',
                                text: 'Expensify Concierge',
                                type: 'TEXT',
                            },
                        ],
                        automatic: false,
                        avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/894b50e60056c966d12216005fbcacec8ce5a2c0.png',
                        created: '2024-11-05 11:10:43.943',
                        message: [
                            {
                                html: 'Let’s get you set up <emoji>🔧</emoji>',
                                text: 'Let’s get you set up 🔧',
                                type: 'COMMENT',
                                whisperedTo: [],
                            },
                        ],
                        originalMessage: {},
                        isFirstItem: false,
                        isAttachmentWithText: false,
                        shouldShow: true,
                        isOptimisticAction: true,
                        lastModified: '2024-11-05 11:10:43.943',
                    },
                    '5286007009323266706': {
                        reportActionID: '5286007009323266706',
                        actionName: 'ADDCOMMENT',
                        actorAccountID: 8392101,
                        person: [
                            {
                                style: 'strong',
                                text: 'Expensify Concierge',
                                type: 'TEXT',
                            },
                        ],
                        automatic: false,
                        avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/894b50e60056c966d12216005fbcacec8ce5a2c0.png',
                        created: '2024-11-05 11:10:43.944',
                        message: [
                            {
                                html: "Expensify is best known for expense and corporate card management, but we do a lot more than that. Let me know what you're interested in and I'll help get you started.",
                                text: "Expensify is best known for expense and corporate card management, but we do a lot more than that. Let me know what you're interested in and I'll help get you started.",
                                type: 'COMMENT',
                                whisperedTo: [],
                            },
                        ],
                        originalMessage: {},
                        isFirstItem: false,
                        isAttachmentWithText: false,
                        shouldShow: true,
                        isOptimisticAction: true,
                        lastModified: '2024-11-05 11:10:43.944',
                    },
                    '4422060638727390382': {
                        actionName: 'ADDCOMMENT',
                        actorAccountID: 8392101,
                        avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/894b50e60056c966d12216005fbcacec8ce5a2c0.png',
                        created: '2024-11-05 11:11:47.086',
                        lastModified: '2024-11-05 11:11:47.086',
                        message: [
                            {
                                html: 'Let\'s get your company set up! Setup Specialist - BreAnna, your dedicated specialist, is online now and can answer your initial questions or provide a demo.<br /><br /><a href="https://www.expensify.com/newdotreport?reportID=4148694821839494" target="_blank" rel="noreferrer noopener">💬 CHAT WITH YOUR SETUP SPECIALIST</a>',
                                text: "Let's get your company set up! Setup Specialist - BreAnna, your dedicated specialist, is online now and can answer your initial questions or provide a demo.\n\n💬 CHAT WITH YOUR SETUP SPECIALIST",
                                type: 'COMMENT',
                                whisperedTo: [],
                            },
                        ],
                        originalMessage: {},
                        person: [
                            {
                                style: 'strong',
                                text: 'Expensify Concierge',
                                type: 'TEXT',
                            },
                        ],
                        reportActionID: '4422060638727390382',
                        shouldShow: true,
                    },
                    '2824688328360312239': {
                        actionName: 'ADDCOMMENT',
                        actorAccountID: 8392101,
                        avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/894b50e60056c966d12216005fbcacec8ce5a2c0.png',
                        created: '2024-11-05 11:19:18.703',
                        lastModified: '2024-11-05 11:19:18.703',
                        message: [
                            {
                                html: '<h1>You’ve started a free trial!</h1><br />Welcome to your free 7-day trial of Expensify <emoji>🎉</emoji> Use it to continue exploring your workspace\'s benefits, including tracking expenses, reimbursing employees, managing company spend, and more.<br /><br />If you have any questions, chat with your dedicated Setup Specialist in <a href="https://new.expensify.com/r/4148694821839494" target="_blank" rel="noreferrer noopener">#admins</a>. Enjoy!',
                                text: "You’ve started a free trial!\n\nWelcome to your free 7-day trial of Expensify 🎉 Use it to continue exploring your workspace's benefits, including tracking expenses, reimbursing employees, managing company spend, and more.\n\nIf you have any questions, chat with your dedicated Setup Specialist in #admins. Enjoy!",
                                type: 'COMMENT',
                                whisperedTo: [],
                            },
                        ],
                        originalMessage: {},
                        person: [
                            {
                                style: 'strong',
                                text: 'Expensify Concierge',
                                type: 'TEXT',
                            },
                        ],
                        reportActionID: '2824688328360312239',
                        shouldShow: true,
                    },
                },
                reportActions_6955627196303088: {
                    '1493209744740418100': {
                        reportActionID: '1493209744740418100',
                        actionName: 'CREATED',
                        actorAccountID: 18634488,
                        message: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'ajsdjajdjadjajsjajdsj123@gmail.com',
                            },
                            {
                                type: 'TEXT',
                                style: 'normal',
                                text: ' created this report',
                            },
                        ],
                        person: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'adasdasd',
                            },
                        ],
                        automatic: false,
                        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
                        created: '2024-11-05 11:19:18.285',
                        shouldShow: true,
                    },
                    '8722650843049927838': {
                        actionName: 'IOU',
                        actorAccountID: 18634488,
                        automatic: false,
                        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
                        isAttachmentOnly: false,
                        originalMessage: {
                            amount: 12300,
                            comment: '',
                            currency: 'VND',
                            IOUTransactionID: '3106135972713435169',
                            IOUReportID: '6955627196303088',
                        },
                        message: [
                            {
                                deleted: '',
                                html: '₫123 expense',
                                isDeletedParentAction: false,
                                isEdited: false,
                                text: '₫123 expense',
                                type: 'COMMENT',
                                whisperedTo: [],
                            },
                        ],
                        person: [
                            {
                                style: 'strong',
                                text: 'adasdasd',
                                type: 'TEXT',
                            },
                        ],
                        reportActionID: '8722650843049927838',
                        shouldShow: true,
                        created: '2024-11-05 11:19:18.706',
                        childReportID: '4286515777714555',
                        lastModified: '2024-11-05 11:19:18.706',
                        childReportNotificationPreference: 'hidden',
                        childType: 'chat',
                        reportActionTimestamp: 1730805558706,
                        sequenceNumber: 1,
                        timestamp: 1730805558,
                        whisperedToAccountIDs: [],
                    },
                    '1783566081350093529': {
                        actionName: 'IOU',
                        actorAccountID: 18634488,
                        automatic: false,
                        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
                        isAttachmentOnly: false,
                        originalMessage: {
                            amount: 45600,
                            comment: '',
                            currency: 'VND',
                            IOUTransactionID: '3690687111940510713',
                            IOUReportID: '6955627196303088',
                        },
                        message: [
                            {
                                deleted: '',
                                html: '₫456 expense',
                                isDeletedParentAction: false,
                                isEdited: false,
                                text: '₫456 expense',
                                type: 'COMMENT',
                                whisperedTo: [],
                            },
                        ],
                        person: [
                            {
                                style: 'strong',
                                text: 'adasdasd',
                                type: 'TEXT',
                            },
                        ],
                        reportActionID: '1783566081350093529',
                        shouldShow: true,
                        created: '2024-11-05 11:20:22.065',
                        childReportID: '7900715127836904',
                        lastModified: '2024-11-05 11:20:22.065',
                        childReportNotificationPreference: 'hidden',
                        childType: 'chat',
                        reportActionTimestamp: 1730805622065,
                        sequenceNumber: 2,
                        timestamp: 1730805622,
                        whisperedToAccountIDs: [],
                    },
                },
                reportActions_4286515777714555: {
                    '1995312838979534584': {
                        reportActionID: '1995312838979534584',
                        actionName: 'CREATED',
                        actorAccountID: 18634488,
                        message: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'ajsdjajdjadjajsjajdsj123@gmail.com',
                            },
                            {
                                type: 'TEXT',
                                style: 'normal',
                                text: ' created this report',
                            },
                        ],
                        person: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'adasdasd',
                            },
                        ],
                        automatic: false,
                        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
                        created: '2024-11-05 11:19:18.288',
                        shouldShow: true,
                    },
                },
                reportActions_7900715127836904: {
                    '3536855248086336861': {
                        reportActionID: '3536855248086336861',
                        actionName: 'CREATED',
                        actorAccountID: 18634488,
                        message: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'ajsdjajdjadjajsjajdsj123@gmail.com',
                            },
                            {
                                type: 'TEXT',
                                style: 'normal',
                                text: ' created this report',
                            },
                        ],
                        person: [
                            {
                                type: 'TEXT',
                                style: 'strong',
                                text: 'adasdasd',
                            },
                        ],
                        automatic: false,
                        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_1.png',
                        created: '2024-11-05 11:20:21.589',
                        shouldShow: true,
                    },
                },
            };

            await Onyx.multiSet({
                ...MOCK_REPORTS,
                ...actions,
                [ONYXKEYS.SESSION]: {
                    accountID: 18634488,
                },
                transactionViolations_3106135972713435169: [
                    {
                        name: 'missingCategory',
                        type: 'violation',
                    },
                ],
                transactionViolations_3690687111940510713: [
                    {
                        name: 'missingCategory',
                        type: 'violation',
                    },
                ],
            });

            await waitForBatchedUpdates();

            const result = getBrickRoadForPolicy(report, actions);
            expect(result).toBe('error');
        });
    });
});
