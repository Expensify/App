import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as ReportUtils from '../../src/libs/ReportUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import * as LHNTestUtils from '../utils/LHNTestUtils';

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

beforeAll(() => waitForPromisesToResolve()
    .then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS, participantsPersonalDetails))
    .then(() => Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail})));
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
                    participants: [currentUserEmail, 'ragnar@vikings.net'],
                })).toBe('Ragnar Lothbrok');
            });

            test('no displayName', () => {
                expect(ReportUtils.getReportName({
                    participants: [currentUserEmail, 'floki@vikings.net'],
                })).toBe('floki@vikings.net');
            });

            test('SMS', () => {
                expect(ReportUtils.getReportName({
                    participants: [currentUserEmail, '+12223334444@expensify.sms'],
                })).toBe('2223334444');
            });
        });

        test('Group DM', () => {
            expect(ReportUtils.getReportName({
                participants: [currentUserEmail, 'ragnar@vikings.net', 'floki@vikings.net', 'lagertha@vikings.net', '+12223334444@expensify.sms'],
            })).toBe('Ragnar, floki@vikings.net, Lagertha, 2223334444');
        });

        describe('Default Policy Room', () => {
            const baseAdminsRoom = {
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                reportName: '#admins',
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
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                reportName: '#VikingsChat',
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
                        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        policyID: policy.policyID,
                        isOwnPolicyExpenseChat: true,
                        ownerEmail: 'ragnar@vikings.net',
                    }, policies)).toBe('Vikings Policy');
                });

                test('as admin', () => {
                    expect(ReportUtils.getReportName({
                        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        policyID: policy.policyID,
                        isOwnPolicyExpenseChat: false,
                        ownerEmail: 'ragnar@vikings.net',
                    }, policies)).toBe('Ragnar Lothbrok');
                });
            });

            describe('Archived', () => {
                const baseArchivedPolicyExpenseChat = {
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

                    expect(ReportUtils.getReportName(memberArchivedPolicyExpenseChat, policies)).toBe('Vikings Policy (archived)');

                    return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es')
                        .then(() => expect(ReportUtils.getReportName(memberArchivedPolicyExpenseChat, policies)).toBe('Vikings Policy (archivado)'));
                });

                test('as admin', () => {
                    const adminArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: false,
                    };

                    expect(ReportUtils.getReportName(adminArchivedPolicyExpenseChat)).toBe('Ragnar Lothbrok (archived)');

                    return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es')
                        .then(() => expect(ReportUtils.getReportName(adminArchivedPolicyExpenseChat)).toBe('Ragnar Lothbrok (archivado)'));
                });
            });
        });
    });

    describe('hasOutstandingIOU', () => {
        it('returns false when there is no report', () => {
            expect(ReportUtils.hasOutstandingIOU()).toBe(false);
        });
        it('returns false when the report has no iouReportID', () => {
            const report = LHNTestUtils.getFakeReport();
            expect(ReportUtils.hasOutstandingIOU(report)).toBe(false);
        });
        it('returns false when there is no iouReports collection', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
            };
            expect(ReportUtils.hasOutstandingIOU(report)).toBe(false);
        });
        it('returns false when there is no matching IOU report', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
            };
            const iouReports = {};
            expect(ReportUtils.hasOutstandingIOU(report, undefined, iouReports)).toBe(false);
        });
        it('returns false when the matched IOU report does not have an owner email', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
            };
            const iouReports = {
                report_1: {
                    reportID: '1',
                },
            };
            expect(ReportUtils.hasOutstandingIOU(report, undefined, iouReports)).toBe(false);
        });
        it('returns false when the matched IOU report does not have an owner email', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
            };
            const iouReports = {
                report_1: {
                    reportID: '1',
                    ownerEmail: 'a@a.com',
                },
            };
            expect(ReportUtils.hasOutstandingIOU(report, 'b@b.com', iouReports)).toBe(false);
        });
        it('returns true when the report has an oustanding IOU', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
                hasOutstandingIOU: true,
            };
            const iouReports = {
                report_1: {
                    reportID: '1',
                    ownerEmail: 'a@a.com',
                },
            };
            expect(ReportUtils.hasOutstandingIOU(report, 'b@b.com', iouReports)).toBe(true);
        });
        it('returns false when the report has no oustanding IOU', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
                hasOutstandingIOU: false,
            };
            const iouReports = {
                report_1: {
                    reportID: '1',
                    ownerEmail: 'a@a.com',
                },
            };
            expect(ReportUtils.hasOutstandingIOU(report, 'b@b.com', iouReports)).toBe(false);
        });
    });
});
