import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as ReportUtils from '../../src/libs/ReportUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

const REPORT_TYPE_CHAT = {
    reportNameValuePairs: {
        type: CONST.REPORT.TYPE.CHAT,
    },
};

const currentUserEmail = 'bjorn@vikings.net';
const participantsPersonalDetails = {
    'ragnar@vikings.net': {
        displayName: 'Ragnar Lothbrok',
        firstName: 'Ragnar',
        login: 'ragnar@vikings.net',
    },
    'floki@vikings.net': {
        login: 'floki@vikings.net',
    },
    'lagertha@vikings.net': {
        displayName: 'Lagertha Lothbrok',
        firstName: 'Lagertha',
        login: 'lagertha@vikings.net',
        pronouns: 'She/her',
    },
    '+12223334444@expensify.sms': {
        login: '+12223334444@expensify.sms',
    },
};
const policy = {
    policyID: 1,
    name: 'Vikings Policy',
};
const policies = {
    [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
};

Onyx.init({keys: ONYXKEYS});

beforeAll(() => Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail}));
beforeEach(() => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.DEFAULT_LOCALE).then(waitForPromisesToResolve));

describe('ReportUtils', () => {
    describe('getDisplayNamesWithTooltips', () => {
        test('withSingleParticipantReport', () => {
            expect(ReportUtils.getDisplayNamesWithTooltips(participantsPersonalDetails, false)).toStrictEqual([
                {
                    displayName: 'Ragnar Lothbrok',
                    tooltip: 'ragnar@vikings.net',
                    pronouns: undefined,
                },
                {
                    displayName: 'floki@vikings.net',
                    tooltip: 'floki@vikings.net',
                    pronouns: undefined,
                },
                {
                    displayName: 'Lagertha Lothbrok',
                    tooltip: 'lagertha@vikings.net',
                    pronouns: 'She/her',
                },
                {
                    displayName: '2223334444',
                    tooltip: '+12223334444',
                    pronouns: undefined,
                },
            ]);
        });

        test('withMultiParticipantReport', () => {
            expect(ReportUtils.getDisplayNamesWithTooltips(participantsPersonalDetails, true)).toStrictEqual([
                {
                    displayName: 'Ragnar',
                    tooltip: 'ragnar@vikings.net',
                    pronouns: undefined,
                },
                {
                    displayName: 'floki@vikings.net',
                    tooltip: 'floki@vikings.net',
                    pronouns: undefined,
                },
                {
                    displayName: 'Lagertha',
                    tooltip: 'lagertha@vikings.net',
                    pronouns: 'She/her',
                },
                {
                    displayName: '2223334444',
                    tooltip: '+12223334444',
                    pronouns: undefined,
                },
            ]);
        });
    });

    describe('getReportName', () => {
        describe('1:1 DM', () => {
            test('with displayName', () => {
                expect(ReportUtils.getReportName({
                    ...REPORT_TYPE_CHAT,
                    participants: [currentUserEmail, 'ragnar@vikings.net'],
                }, _.pick(participantsPersonalDetails, 'ragnar@vikings.net'))).toBe('Ragnar Lothbrok');
            });

            test('no displayName', () => {
                expect(ReportUtils.getReportName({
                    ...REPORT_TYPE_CHAT,
                    participants: [currentUserEmail, 'floki@vikings.net'],
                }, _.pick(participantsPersonalDetails, 'floki@vikings.net'))).toBe('floki@vikings.net');
            });

            test('SMS', () => {
                expect(ReportUtils.getReportName({
                    ...REPORT_TYPE_CHAT,
                    participants: [currentUserEmail, '+12223334444@expensify.sms'],
                }, _.pick(participantsPersonalDetails, '+12223334444@expensify.sms'))).toBe('2223334444');
            });
        });

        test('Group DM', () => {
            expect(ReportUtils.getReportName({
                ...REPORT_TYPE_CHAT,
                participants: [currentUserEmail, 'ragnar@vikings.net', 'floki@vikings.net', 'lagertha@vikings.net', '+12223334444@expensify.sms'],
            }, participantsPersonalDetails)).toBe('Ragnar, floki@vikings.net, Lagertha, 2223334444');
        });

        describe('Default Policy Room', () => {
            const baseAdminsRoom = {
                ...REPORT_TYPE_CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                reportName: 'admins',
            };

            test('Active', () => {
                expect(ReportUtils.getReportName(baseAdminsRoom)).toBe('#admins');
            });

            test('Archived', () => {
                const archivedAdminsRoom = {
                    ...baseAdminsRoom,
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                expect(ReportUtils.getReportName(archivedAdminsRoom)).toBe('#admins (archived)');

                return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es')
                    .then(() => expect(ReportUtils.getReportName(archivedAdminsRoom)).toBe('#admins (archivado)'));
            });
        });

        describe('User-Created Policy Room', () => {
            const baseUserCreatedRoom = {
                ...REPORT_TYPE_CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                reportName: 'VikingsChat',
            };

            test('Active', () => {
                expect(ReportUtils.getReportName(baseUserCreatedRoom)).toBe('#VikingsChat');
            });

            test('Archived', () => {
                const archivedPolicyRoom = {
                    ...baseUserCreatedRoom,
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                expect(ReportUtils.getReportName(archivedPolicyRoom)).toBe('#VikingsChat (archived)');

                return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es')
                    .then(() => expect(ReportUtils.getReportName(archivedPolicyRoom)).toBe('#VikingsChat (archivado)'));
            });
        });

        describe('PolicyExpenseChat', () => {
            describe('Active', () => {
                test('as member', () => {
                    expect(ReportUtils.getReportName({
                        ...REPORT_TYPE_CHAT,
                        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        policyID: policy.policyID,
                        isOwnPolicyExpenseChat: true,
                    }, {}, policies)).toBe(policy.name);
                });

                test('as admin', () => {
                    expect(ReportUtils.getReportName({
                        ...REPORT_TYPE_CHAT,
                        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        policyID: policy.policyID,
                        isOwnPolicyExpenseChat: false,
                        ownerEmail: 'ragnar@vikings.net',
                    }, participantsPersonalDetails, policies)).toBe('Ragnar Lothbrok');
                });
            });

            describe('Archived', () => {
                const baseArchivedPolicyExpenseChat = {
                    ...REPORT_TYPE_CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    ownerEmail: 'ragnar@vikings.net',
                    policyID: policy.policyID,
                    oldPolicyName: policy.name,
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                test('as member', () => {
                    const memberArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: true,
                    };

                    expect(ReportUtils.getReportName(memberArchivedPolicyExpenseChat)).toBe('Vikings Policy (archived)');

                    return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es')
                        .then(() => expect(ReportUtils.getReportName(memberArchivedPolicyExpenseChat)).toBe('Vikings Policy (archivado)'));
                });

                test('as admin', () => {
                    const adminArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: false,
                    };

                    expect(ReportUtils.getReportName(adminArchivedPolicyExpenseChat, participantsPersonalDetails)).toBe('Ragnar Lothbrok (archived)');

                    return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es')
                        .then(() => expect(ReportUtils.getReportName(adminArchivedPolicyExpenseChat, participantsPersonalDetails)).toBe('Ragnar Lothbrok (archivado)'));
                });
            });
        });
    });
});
