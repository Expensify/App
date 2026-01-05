import Onyx from 'react-native-onyx';
import {translate} from '@libs/Localize';
import {
    buildReportNameFromParticipantNames,
    computeReportName,
    getGroupChatName,
    getInvoicePayerName,
    getInvoicesChatName,
    getPolicyExpenseChatName,
    getReportName as getSimpleReportName,
} from '@libs/ReportNameUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportAction, ReportActions, ReportAttributesDerivedValue, ReportNameValuePairs} from '@src/types/onyx';
import {createAdminRoom, createPolicyExpenseChat, createRegularChat, createRegularTaskReport, createSelfDM, createWorkspaceThread} from '../utils/collections/reports';
import {fakePersonalDetails} from '../utils/LHNTestUtils';
import {formatPhoneNumber} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('ReportNameUtils', () => {
    const currentUserAccountID = 5;
    const participantsPersonalDetails: PersonalDetailsList = [
        {
            accountID: 1,
            displayName: 'Ragnar Lothbrok',
            firstName: 'Ragnar',
            login: 'ragnar@vikings.net',
        },
        {
            accountID: 2,
            login: 'floki@vikings.net',
            displayName: 'floki@vikings.net',
        },
        {
            accountID: 3,
            displayName: 'Lagertha Lothbrok',
            firstName: 'Lagertha',
            login: 'lagertha@vikings.net',
            pronouns: 'She/her',
        },
        {
            accountID: 4,
            login: '+18332403627@expensify.sms',
            displayName: '(833) 240-3627',
        },
        {
            accountID: 5,
            displayName: 'Lagertha Lothbrok',
            firstName: 'Lagertha',
            login: 'lagertha2@vikings.net',
            pronouns: 'She/her',
        },
    ].reduce((acc, detail) => {
        // eslint-disable-next-line no-param-reassign
        acc[String(detail.accountID)] = detail;
        return acc;
    }, {} as PersonalDetailsList);

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: participantsPersonalDetails,
            [ONYXKEYS.SESSION]: {accountID: currentUserAccountID, email: 'lagertha2@vikings.net'},
        });
        await IntlStore.load(CONST.LOCALES.EN);
        await waitForBatchedUpdates();
    });

    const emptyCollections = {
        reports: {} as Record<string, Report>,
        policies: {} as Record<string, Policy>,
        transactions: {} as Record<string, unknown>,
        reportNameValuePairs: {} as Record<string, ReportNameValuePairs>,
        reportActions: {} as Record<string, ReportActions>,
    };

    describe('computeReportName - DMs and Group chats', () => {
        test('1:1 DM with displayName', () => {
            const report: Report = {
                ...createRegularChat(1, [currentUserAccountID, 1]),
                ownerAccountID: currentUserAccountID,
            };

            const name = computeReportName(report, emptyCollections.reports, emptyCollections.policies, undefined, undefined, participantsPersonalDetails, emptyCollections.reportActions);
            expect(name).toBe('Ragnar Lothbrok');
        });

        test('1:1 DM without displayName uses login', () => {
            const report: Report = {
                ...createRegularChat(2, [currentUserAccountID, 2]),
                ownerAccountID: currentUserAccountID,
            };

            const name = computeReportName(report, emptyCollections.reports, emptyCollections.policies, undefined, undefined, participantsPersonalDetails, emptyCollections.reportActions);
            expect(name).toBe('floki@vikings.net');
        });

        test('1:1 DM SMS uses formatted phone', () => {
            const report: Report = {
                ...createRegularChat(3, [currentUserAccountID, 4]),
                ownerAccountID: currentUserAccountID,
            };

            const name = computeReportName(report, emptyCollections.reports, emptyCollections.policies, undefined, undefined, participantsPersonalDetails, emptyCollections.reportActions);
            expect(name).toBe('(833) 240-3627');
        });

        test('Group DM uses up to 5 participant short names', async () => {
            const report: Report = {
                ...createRegularChat(4, [currentUserAccountID, 1, 2, 3, 4]),
                ownerAccountID: currentUserAccountID,
                reportName: undefined,
            };

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
            const name = computeReportName(report, emptyCollections.reports, emptyCollections.policies, undefined, undefined, participantsPersonalDetails, emptyCollections.reportActions);
            expect(name).toBe('Ragnar, floki@vikings.net, Lagertha, (833) 240-3627');
        });
    });

    describe('computeReportName - Admin room', () => {
        test('Active admin room', () => {
            const report = createAdminRoom(10);
            const name = computeReportName(report, emptyCollections.reports, emptyCollections.policies, undefined, undefined, participantsPersonalDetails, emptyCollections.reportActions);
            expect(name).toBe('#admins');
        });

        test('Archived admin room in EN and ES', async () => {
            const report = createAdminRoom(11);
            const reportNameValuePairs = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]: {private_isArchived: 'true'},
            } as Record<string, ReportNameValuePairs>;

            const nameEn = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                reportNameValuePairs,
                participantsPersonalDetails,
                emptyCollections.reportActions,
            );
            expect(nameEn).toBe('#admins (archived)');

            await IntlStore.load(CONST.LOCALES.ES);
            const nameEs = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                reportNameValuePairs,
                participantsPersonalDetails,
                emptyCollections.reportActions,
            );
            expect(nameEs).toBe('#admins (archivado)');

            await IntlStore.load(CONST.LOCALES.EN);
        });
    });

    describe('computeReportName - Policy expense chat', () => {
        test('Returns policy expense chat name when owner is set', async () => {
            const report: Report = {
                ...createPolicyExpenseChat(20, true),
                ownerAccountID: 1,
            };

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
            const name = computeReportName(report, emptyCollections.reports, emptyCollections.policies, undefined, undefined, participantsPersonalDetails, emptyCollections.reportActions);
            expect(name).toBe("Ragnar Lothbrok's expenses");
        });
    });

    describe('computeReportName - Self DM', () => {
        test('Returns self DM with postfix', async () => {
            const report: Report = {
                ...createSelfDM(30, currentUserAccountID),
                ownerAccountID: currentUserAccountID,
            };

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: 'lagertha2@vikings.net', authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
            const name = computeReportName(report, emptyCollections.reports, emptyCollections.policies, undefined, undefined, participantsPersonalDetails, emptyCollections.reportActions);
            expect(name).toBe('Lagertha Lothbrok (you)');
        });
    });

    describe('computeReportName - Task report', () => {
        test('Extracts plain text from HTML title', () => {
            const htmlTaskTitle = '<h1>heading with <a href="https://example.com">link</a></h1>';
            const report: Report = {
                ...createRegularTaskReport(40, currentUserAccountID),
                reportName: htmlTaskTitle,
            };

            const name = computeReportName(report, emptyCollections.reports, emptyCollections.policies, undefined, undefined, participantsPersonalDetails, emptyCollections.reportActions);
            expect(name).toBe('heading with link');
        });
    });

    describe('computeReportName - Thread report action names', () => {
        test('Submitted parent action', () => {
            const thread: Report = createWorkspaceThread(50);
            const parentAction: ReportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    message: 'via workflow',
                },
            } as unknown as ReportAction;

            expect(thread.parentReportID).toBeDefined();
            expect(thread.parentReportActionID).toBeDefined();
            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {
                    [actionId]: parentAction,
                },
            };

            const expected = translate(CONST.LOCALES.EN, 'iou.submitted', {memo: 'via workflow'});
            const name = computeReportName(thread, emptyCollections.reports, emptyCollections.policies, undefined, undefined, participantsPersonalDetails, reportActionsCollection);
            expect(name).toBe(expected);
        });

        test('Rejected parent action', () => {
            const thread: Report = createWorkspaceThread(51);
            const parentAction: ReportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.REJECTED,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
            } as unknown as ReportAction;

            expect(thread.parentReportID).toBeDefined();
            expect(thread.parentReportActionID).toBeDefined();
            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {
                    [actionId]: parentAction,
                },
            };

            const expected = translate(CONST.LOCALES.EN, 'iou.rejectedThisReport');
            const name = computeReportName(thread, emptyCollections.reports, emptyCollections.policies, undefined, undefined, participantsPersonalDetails, reportActionsCollection);
            expect(name).toBe(expected);
        });
    });

    describe('getReportName (derived value vs fallback)', () => {
        test('Returns derived value when provided', () => {
            const report: Report = {
                ...createPolicyExpenseChat(60, true),
                reportID: '60',
                ownerAccountID: 1,
            };

            const derived: ReportAttributesDerivedValue['reports'] = {
                [report.reportID]: {
                    reportName: "Ragnar Lothbrok's expenses",
                    isEmpty: false,
                    brickRoadStatus: undefined,
                    requiresAttention: false,
                    reportErrors: {},
                },
            };

            expect(getSimpleReportName(report, derived)).toBe("Ragnar Lothbrok's expenses");
        });

        test('Falls back to report.reportName when derived missing', () => {
            const report: Report = {
                ...createRegularChat(61, [currentUserAccountID, 1]),
                reportID: '61',
                reportName: 'Custom Report Name',
                ownerAccountID: currentUserAccountID,
            };

            expect(getSimpleReportName(report, {} as never)).toBe('Custom Report Name');
        });

        test('Returns empty string when neither present', () => {
            const report: Report = {
                ...createRegularChat(62, [currentUserAccountID, 1]),
                reportID: '62',
                ownerAccountID: currentUserAccountID,
                reportName: undefined,
            };

            expect(getSimpleReportName(report, {} as never)).toBe('');
        });
    });

    describe('computeReportName - reportNameValuePairs archiving', () => {
        test('Regular chat gets archived suffix from reportNameValuePairs', async () => {
            const report: Report = {
                ...createRegularChat(70, [currentUserAccountID, 1]),
                ownerAccountID: currentUserAccountID,
                reportName: undefined,
            };
            const reportNameValuePairs = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]: {private_isArchived: 'true'},
            } as Record<string, ReportNameValuePairs>;

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                reportNameValuePairs,
                participantsPersonalDetails,
                emptyCollections.reportActions,
            );
            expect(name).toBe('Ragnar Lothbrok (archived) ');
        });
    });

    describe('buildReportNameFromParticipantNames', () => {
        test('Excludes current user and uses short names for multiple participants', () => {
            const report = {
                ...createRegularChat(1000, [currentUserAccountID, 1, 2]),
            };

            const name = buildReportNameFromParticipantNames({report, personalDetailsList: participantsPersonalDetails});
            expect(name).toBe('Ragnar, floki@vikings.net');
        });

        test('Uses full name when only one participant remains after filtering current user', () => {
            const report = {
                ...createRegularChat(1001, [currentUserAccountID, 1]),
            };

            const name = buildReportNameFromParticipantNames({report, personalDetailsList: participantsPersonalDetails});
            expect(name).toBe('Ragnar Lothbrok');
        });
    });

    describe('Invoice naming helpers', () => {
        test('Invoice room uses policy name when current user is receiver', () => {
            const receiverPolicy = {name: 'Personal Workspace'} as unknown as Policy;
            const report: Report = {
                reportID: 'invoice-chat-1',
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: currentUserAccountID},
                policyName: 'Personal Workspace',
            };

            const name = getInvoicesChatName({
                report,
                receiverPolicy,
                personalDetails: participantsPersonalDetails,
            });

            expect(name).toBe('Personal Workspace');
        });

        test('Invoice room displays receiver name for other individuals', () => {
            const receiverPolicy = {name: 'Vendor Workspace'} as unknown as Policy;
            const report: Report = {
                reportID: 'invoice-chat-2',
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 1},
                policyName: 'Vendor Workspace',
            };

            const name = getInvoicesChatName({
                report,
                receiverPolicy,
                personalDetails: participantsPersonalDetails,
            });

            const normalizedName = name?.replaceAll('\u00A0', ' ');
            expect(normalizedName).toBe('Ragnar Lothbrok');
        });

        test('Invoice payer name falls back to provided personal details', () => {
            const report: Report = {
                reportID: 'invoice-chat-3',
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 1},
            };
            const name = getInvoicePayerName(report, undefined, null);

            const normalizedName = name?.replaceAll('\u00A0', ' ');
            expect(normalizedName).toBe('Ragnar Lothbrok');
        });
    });

    describe('getPolicyExpenseChatName', () => {
        it("returns owner's display name when available", () => {
            const report = {
                ownerAccountID: 1,
                reportName: 'Fallback Report Name',
            } as unknown as Report;

            const name = getPolicyExpenseChatName({report, personalDetailsList: participantsPersonalDetails});
            expect(name).toBe(translate(CONST.LOCALES.EN, 'workspace.common.policyExpenseChatName', {displayName: 'Ragnar Lothbrok'}));
        });

        it('falls back to owner login when display name not present', () => {
            const report = {
                ownerAccountID: 2,
                reportName: 'Fallback Report Name',
            } as unknown as Report;

            const name = getPolicyExpenseChatName({report, personalDetailsList: participantsPersonalDetails});
            expect(name).toBe(translate(CONST.LOCALES.EN, 'workspace.common.policyExpenseChatName', {displayName: 'floki'}));
        });

        it('returns report name when no personal details or owner', () => {
            const report = {
                ownerAccountID: undefined,
                reportName: 'Fallback Report Name',
            } as unknown as Report;

            const name = getPolicyExpenseChatName({report, personalDetailsList: {}});
            expect(name).toBe('Fallback Report Name');
        });
    });

    describe('getGroupChatName', () => {
        afterEach(() => Onyx.clear());

        const fourParticipants = [
            {accountID: 1, login: 'email1@test.com'},
            {accountID: 2, login: 'email2@test.com'},
            {accountID: 3, login: 'email3@test.com'},
            {accountID: 4, login: 'email4@test.com'},
        ];

        const eightParticipants = [
            {accountID: 1, login: 'email1@test.com'},
            {accountID: 2, login: 'email2@test.com'},
            {accountID: 3, login: 'email3@test.com'},
            {accountID: 4, login: 'email4@test.com'},
            {accountID: 5, login: 'email5@test.com'},
            {accountID: 6, login: 'email6@test.com'},
            {accountID: 7, login: 'email7@test.com'},
            {accountID: 8, login: 'email8@test.com'},
        ];

        describe('When participantAccountIDs is passed to getGroupChatName', () => {
            it('shows all participants when count <= 5 and shouldApplyLimit is false', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, fourParticipants)).toEqual('Four, One, Three, Two');
            });

            it('shows all participants when count <= 5 and shouldApplyLimit is true', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, fourParticipants, true)).toEqual('Four, One, Three, Two');
            });

            it('shows 5 participants with ellipsis when count > 5 and shouldApplyLimit is true', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, eightParticipants, true)).toEqual('Five, Four, One, Three, Two...');
            });

            it('shows all participants when count > 5 and shouldApplyLimit is false', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, eightParticipants, false)).toEqual('Eight, Five, Four, One, Seven, Six, Three, Two');
            });

            it('uses correct display names for participants', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, fourParticipants, true)).toEqual('(833) 240-3627, floki@vikings.net, Lagertha, Ragnar');
            });
        });

        describe('When participantAccountIDs is not passed and report is provided', () => {
            it('uses report name when available (no limit)', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, undefined, false, report)).toEqual("Let's talk");
            });

            it('uses report name when available (limit true)', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, undefined, true, report)).toEqual("Let's talk");
            });

            it('uses report name when >5 participants and limit true', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4, 5, 6, 7, 8]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, undefined, true, report)).toEqual("Let's talk");
            });

            it('uses report name when >5 participants and limit false', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4, 5, 6, 7, 8]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, undefined, false, report)).toEqual("Let's talk");
            });

            it('falls back to participant names when report name is empty', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4, 5, 6, 7, 8]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: '',
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, undefined, false, report)).toEqual('Eight, Five, Four, One, Seven, Six, Three, Two');
            });
        });
    });
});
