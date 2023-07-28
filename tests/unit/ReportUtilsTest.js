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
const currentUserAccountID = 5;
const participantsPersonalDetails = {
    1: {
        accountID: 1,
        displayName: 'Ragnar Lothbrok',
        firstName: 'Ragnar',
        login: 'ragnar@vikings.net',
    },
    2: {
        accountID: 2,
        login: 'floki@vikings.net',
        displayName: 'floki@vikings.net',
    },
    3: {
        accountID: 3,
        displayName: 'Lagertha Lothbrok',
        firstName: 'Lagertha',
        login: 'lagertha@vikings.net',
        pronouns: 'She/her',
    },
    4: {
        accountID: 4,
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
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: participantsPersonalDetails,
            [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
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
                    login: 'ragnar@vikings.net',
                    avatar: {
                        testUri: '../../../assets/images/avatars/user/default-avatar_2.svg',
                    },
                    accountID: 1,
                    pronouns: undefined,
                },
                {
                    displayName: 'floki@vikings.net',
                    avatar: {
                        testUri: '../../../assets/images/avatars/user/default-avatar_3.svg',
                    },
                    login: 'floki@vikings.net',
                    accountID: 2,
                    pronouns: undefined,
                },
                {
                    displayName: 'Lagertha Lothbrok',
                    avatar: {
                        testUri: '../../../assets/images/avatars/user/default-avatar_4.svg',
                    },
                    login: 'lagertha@vikings.net',
                    accountID: 3,
                    pronouns: 'She/her',
                },
                {
                    displayName: '(833) 240-3627',
                    avatar: {
                        testUri: '../../../assets/images/avatars/user/default-avatar_5.svg',
                    },
                    login: '+18332403627@expensify.sms',
                    accountID: 4,
                    pronouns: undefined,
                },
            ]);
        });

        test('withMultiParticipantReport', () => {
            expect(ReportUtils.getDisplayNamesWithTooltips(participantsPersonalDetails, true)).toStrictEqual([
                {
                    displayName: 'Ragnar',
                    login: 'ragnar@vikings.net',
                    avatar: {
                        testUri: '../../../assets/images/avatars/user/default-avatar_2.svg',
                    },
                    accountID: 1,
                    pronouns: undefined,
                },
                {
                    displayName: 'floki@vikings.net',
                    avatar: {
                        testUri: '../../../assets/images/avatars/user/default-avatar_3.svg',
                    },
                    login: 'floki@vikings.net',
                    accountID: 2,
                    pronouns: undefined,
                },
                {
                    displayName: 'Lagertha',
                    avatar: {
                        testUri: '../../../assets/images/avatars/user/default-avatar_4.svg',
                    },
                    login: 'lagertha@vikings.net',
                    accountID: 3,
                    pronouns: 'She/her',
                },
                {
                    displayName: '(833) 240-3627',
                    avatar: {
                        testUri: '../../../assets/images/avatars/user/default-avatar_5.svg',
                    },
                    login: '+18332403627@expensify.sms',
                    accountID: 4,
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
                        participantAccountIDs: [currentUserAccountID, 1],
                    }),
                ).toBe('Ragnar Lothbrok');
            });

            test('no displayName', () => {
                expect(
                    ReportUtils.getReportName({
                        participantAccountIDs: [currentUserAccountID, 2],
                    }),
                ).toBe('floki@vikings.net');
            });

            test('SMS', () => {
                expect(
                    ReportUtils.getReportName({
                        participantAccountIDs: [currentUserAccountID, 4],
                    }),
                ).toBe('(833) 240-3627');
            });
        });

        test('Group DM', () => {
            expect(
                ReportUtils.getReportName({
                    participantAccountIDs: [currentUserAccountID, 1, 2, 3, 4],
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
                            ownerAccountID: 1,
                        }),
                    ).toBe('Vikings Policy');
                });

                test('as admin', () => {
                    expect(
                        ReportUtils.getReportName({
                            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            policyID: policy.policyID,
                            isOwnPolicyExpenseChat: false,
                            ownerAccountID: 1,
                        }),
                    ).toBe('Ragnar Lothbrok');
                });
            });

            describe('Archived', () => {
                const baseArchivedPolicyExpenseChat = {
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    ownerAccountID: 1,
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

    describe('isWaitingForIOUActionFromCurrentUser', () => {
        it('returns false when there is no report', () => {
            expect(ReportUtils.isWaitingForIOUActionFromCurrentUser()).toBe(false);
        });
        it('returns false when there is no reports collection', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
            };
            expect(ReportUtils.isWaitingForIOUActionFromCurrentUser(report)).toBe(false);
        });
        it('returns false when the report has no iouReportID', () => {
            const report = LHNTestUtils.getFakeReport();
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}2`, {
                reportID: '2',
            }).then(() => {
                expect(ReportUtils.isWaitingForIOUActionFromCurrentUser(report)).toBe(false);
            });
        });
        it('returns false when there is no matching IOU report', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
            };
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}2`, {
                reportID: '2',
            }).then(() => {
                expect(ReportUtils.isWaitingForIOUActionFromCurrentUser(report)).toBe(false);
            });
        });
        it('returns false when the matched IOU report does not have an owner email', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
            };
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {
                reportID: '1',
            }).then(() => {
                expect(ReportUtils.isWaitingForIOUActionFromCurrentUser(report)).toBe(false);
            });
        });
        it('returns false when the matched IOU report does not have an owner email', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
            };
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {
                reportID: '1',
                ownerAccountID: 99,
            }).then(() => {
                expect(ReportUtils.isWaitingForIOUActionFromCurrentUser(report)).toBe(false);
            });
        });
        it('returns true when the report has an oustanding IOU', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
                hasOutstandingIOU: true,
            };
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {
                reportID: '1',
                ownerAccountID: 99,
                hasOutstandingIOU: true,
            }).then(() => {
                expect(ReportUtils.isWaitingForIOUActionFromCurrentUser(report)).toBe(true);
            });
        });
        it('returns false when the report has no oustanding IOU', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
                hasOutstandingIOU: false,
            };
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {
                reportID: '1',
                ownerAccountID: 99,
                hasOutstandingIOU: false,
            }).then(() => {
                expect(ReportUtils.isWaitingForIOUActionFromCurrentUser(report)).toBe(false);
            });
        });
        it('returns true when the report has no oustanding IOU but is waiting for a bank account', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
                hasOutstandingIOU: false,
            };
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {
                reportID: '1',
                ownerAccountID: currentUserEmail,
                hasOutstandingIOU: false,
                isWaitingOnBankAccount: true,
            }).then(() => {
                expect(ReportUtils.isWaitingForIOUActionFromCurrentUser(report)).toBe(false);
            });
        });
    });

    describe('getMoneyRequestOptions', () => {
        const participantsAccountIDs = _.keys(participantsPersonalDetails);

        beforeAll(() => {
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [currentUserAccountID]: {
                    accountID: currentUserAccountID,
                    login: currentUserEmail,
                },
            });
        });

        afterAll(() => Onyx.clear());

        describe('return empty iou options if', () => {
            it('participants contains excluded iou emails', () => {
                const allEmpty = _.every(CONST.EXPENSIFY_ACCOUNT_IDS, (accountID) => {
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserAccountID, accountID], []);
                    return moneyRequestOptions.length === 0;
                });
                expect(allEmpty).toBe(true);
            });

            it('no participants except self', () => {
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserAccountID], []);
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
                        const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID, participantsAccountIDs[0]], []);
                        return moneyRequestOptions.length === 1 && moneyRequestOptions.includes(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT);
                    },
                );
                expect(onlyHaveSplitOption).toBe(true);
            });

            it('has multiple participants exclude self', () => {
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserAccountID, ...participantsAccountIDs], []);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT)).toBe(true);
            });

            it(' does not have iou send permission', () => {
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserAccountID, ...participantsAccountIDs], []);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT)).toBe(true);
            });
        });

        describe('return only iou request option if', () => {
            it('a policy expense chat', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID, ...participantsAccountIDs], [CONST.BETAS.IOU_SEND]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST)).toBe(true);
            });
        });

        it('return both iou send and request money in DM', () => {
            const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({type: 'chat'}, [currentUserAccountID, participantsAccountIDs[0]], [CONST.BETAS.IOU_SEND]);
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
