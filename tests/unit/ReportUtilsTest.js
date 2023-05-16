import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as ReportUtils from '../../src/libs/ReportUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import * as LHNTestUtils from '../utils/LHNTestUtils';

// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('../../src/libs/Permissions');

const currentUserEmail = 'bjorn@vikings.net';
const participantsPersonalDetails = {
    'ragnar@vikings.net': {
        displayName: 'Ragnar Lothbrok',
        firstName: 'Ragnar',
        login: 'ragnar@vikings.net',
    },
    'floki@vikings.net': {
        login: 'floki@vikings.net',
        displayName: 'floki@vikings.net',
    },
    'lagertha@vikings.net': {
        displayName: 'Lagertha Lothbrok',
        firstName: 'Lagertha',
        login: 'lagertha@vikings.net',
        pronouns: 'She/her',
    },
    '+18332403627@expensify.sms': {
        login: '+18332403627@expensify.sms',
        displayName: '(833) 240-3627',
    },
};
const policy = {
    policyID: 1,
    name: 'Vikings Policy',
};

Onyx.init({keys: ONYXKEYS});

describe('ReportUtils', () => {
    beforeAll(() => {
        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS]: participantsPersonalDetails,
            [ONYXKEYS.SESSION]: {email: currentUserEmail},
            [ONYXKEYS.COUNTRY_CODE]: 1,
            [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
        });
        return waitForPromisesToResolve();
    });
    beforeEach(() => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT).then(waitForPromisesToResolve));

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
                    displayName: '(833) 240-3627',
                    tooltip: '+18332403627',
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
                    displayName: '(833) 240-3627',
                    tooltip: '+18332403627',
                    pronouns: undefined,
                },
            ]);
        });
    });

    describe('getReportName', () => {
        describe('1:1 DM', () => {
            test('with displayName', () => {
                expect(
                    ReportUtils.getReportName({
                        participants: [currentUserEmail, 'ragnar@vikings.net'],
                    }),
                ).toBe('Ragnar Lothbrok');
            });

            test('no displayName', () => {
                expect(
                    ReportUtils.getReportName({
                        participants: [currentUserEmail, 'floki@vikings.net'],
                    }),
                ).toBe('floki@vikings.net');
            });

            test('SMS', () => {
                expect(
                    ReportUtils.getReportName({
                        participants: [currentUserEmail, '+18332403627@expensify.sms'],
                    }),
                ).toBe('(833) 240-3627');
            });
        });

        test('Group DM', () => {
            expect(
                ReportUtils.getReportName({
                    participants: [currentUserEmail, 'ragnar@vikings.net', 'floki@vikings.net', 'lagertha@vikings.net', '+18332403627@expensify.sms'],
                }),
            ).toBe('Ragnar, floki@vikings.net, Lagertha, (833) 240-3627');
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

                return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() => expect(ReportUtils.getReportName(archivedAdminsRoom)).toBe('#admins (archivado)'));
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

                return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() => expect(ReportUtils.getReportName(archivedPolicyRoom)).toBe('#VikingsChat (archivado)'));
            });
        });

        describe('PolicyExpenseChat', () => {
            describe('Active', () => {
                test('as member', () => {
                    expect(
                        ReportUtils.getReportName({
                            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            policyID: policy.policyID,
                            isOwnPolicyExpenseChat: true,
                            ownerEmail: 'ragnar@vikings.net',
                        }),
                    ).toBe('Vikings Policy');
                });

                test('as admin', () => {
                    expect(
                        ReportUtils.getReportName({
                            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            policyID: policy.policyID,
                            isOwnPolicyExpenseChat: false,
                            ownerEmail: 'ragnar@vikings.net',
                        }),
                    ).toBe('Ragnar Lothbrok');
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

                    expect(ReportUtils.getReportName(memberArchivedPolicyExpenseChat)).toBe('Vikings Policy (archived)');

                    return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() =>
                        expect(ReportUtils.getReportName(memberArchivedPolicyExpenseChat)).toBe('Vikings Policy (archivado)'),
                    );
                });

                test('as admin', () => {
                    const adminArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: false,
                    };

                    expect(ReportUtils.getReportName(adminArchivedPolicyExpenseChat)).toBe('Ragnar Lothbrok (archived)');

                    return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() =>
                        expect(ReportUtils.getReportName(adminArchivedPolicyExpenseChat)).toBe('Ragnar Lothbrok (archivado)'),
                    );
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

    describe('getMoneyRequestOptions', () => {
        const participants = _.keys(participantsPersonalDetails);

        beforeAll(() => {
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, {
                [currentUserEmail]: {
                    login: currentUserEmail,
                },
            });
        });

        afterAll(() => Onyx.clear());

        describe('return empty iou options if', () => {
            it('participants contains excluded iou emails', () => {
                const allEmpty = _.every(CONST.EXPENSIFY_EMAILS, (email) => {
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserEmail, email], [CONST.BETAS.IOU]);
                    return moneyRequestOptions.length === 0;
                });
                expect(allEmpty).toBe(true);
            });

            it('no participants except self', () => {
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserEmail], [CONST.BETAS.IOU]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('no iou permission', () => {
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserEmail, participants], []);
                expect(moneyRequestOptions.length).toBe(0);
            });
        });

        describe('return only iou split option if', () => {
            it('a chat room', () => {
                const onlyHaveSplitOption = _.every(
                    [CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, CONST.REPORT.CHAT_TYPE.DOMAIN_ALL, CONST.REPORT.CHAT_TYPE.POLICY_ROOM],
                    (chatType) => {
                        const report = {
                            ...LHNTestUtils.getFakeReport(),
                            chatType,
                        };
                        const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserEmail, participants[0]], [CONST.BETAS.IOU]);
                        return moneyRequestOptions.length === 1 && moneyRequestOptions.includes(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT);
                    },
                );
                expect(onlyHaveSplitOption).toBe(true);
            });

            it('has multiple participants exclude self', () => {
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserEmail, ...participants], [CONST.BETAS.IOU]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT)).toBe(true);
            });
        });

        describe('return only iou request option if', () => {
            it(' does not have iou send permission', () => {
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserEmail, participants], [CONST.BETAS.IOU]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST)).toBe(true);
            });

            it('a policy expense chat', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserEmail, participants], [CONST.BETAS.IOU, CONST.BETAS.IOU_SEND]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST)).toBe(true);
            });
        });

        it('return both iou send and request money', () => {
            const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserEmail, participants], [CONST.BETAS.IOU, CONST.BETAS.IOU_SEND]);
            expect(moneyRequestOptions.length).toBe(2);
            expect(moneyRequestOptions.includes(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST)).toBe(true);
            expect(moneyRequestOptions.includes(CONST.IOU.MONEY_REQUEST_TYPE.SEND)).toBe(true);
        });
    });

    describe('getReportIDFromLink', () => {
        it('should get the correct reportID from a deep link', () => {
            expect(ReportUtils.getReportIDFromLink('new-expensify://r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('https://www.expensify.cash/r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('https://staging.new.expensify.com/r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('http://localhost/r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('http://localhost:8080/r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('https://staging.expensify.cash/r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('https://new.expensify.com/r/75431276')).toBe('75431276');
        });

        it("shouldn't get the correct reportID from a deep link", () => {
            expect(ReportUtils.getReportIDFromLink('new-expensify-not-valid://r/75431276')).toBe('');
            expect(ReportUtils.getReportIDFromLink('new-expensify://settings')).toBe('');
        });
    });
});
