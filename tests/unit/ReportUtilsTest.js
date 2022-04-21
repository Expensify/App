import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as ReportUtils from '../../src/libs/ReportUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

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

beforeAll(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS, participantsPersonalDetails).then(waitForPromisesToResolve));
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

    describe('getTitle', () => {
        test('1:1 DM with displayName', () => {
            expect(ReportUtils.getTitle({
                participants: ['ragnar@vikings.net'],
            })).toBe('Ragnar Lothbrok');
        });
        test('1:1 DM no displayName', () => {
            expect(ReportUtils.getTitle({
                participants: ['floki@vikings.net'],
            })).toBe('floki@vikings.net');
        });
        test('1:1 DM SMS', () => {
            expect(ReportUtils.getTitle({
                participants: ['+12223334444@expensify.sms'],
            })).toBe('2223334444');
        });

        test('Group DM', () => {
            expect(ReportUtils.getTitle({
                participants: ['ragnar@vikings.net', 'lagertha@vikings.net', '+12223334444@expensify.sms'],
            })).toBe('Ragnar, Lagertha, 2223334444');
        });

        test('Active policy room', () => {
            expect(ReportUtils.getTitle({
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                reportName: '#VikingChat',
            })).toBe('#VikingChat');
        });

        test('Archived policy room', () => {
            const archivedPolicyRoom = {
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                reportName: '#VikingChat',
            };

            expect(ReportUtils.getTitle(archivedPolicyRoom)).toBe('#VikingChat (archived)');

            return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es')
                .then(() => expect(ReportUtils.getTitle(archivedPolicyRoom)).toBe('#VikingChat (archivado)'));
        });

        test('Active PolicyExpenseChat', () => {
            expect(ReportUtils.getTitle({
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: policy.policyID,
            }, policies)).toBe(policy.name);
        });

        test('Archived PolicyExpenseChat', () => {
            const archivedPolicyExpenseChat = {
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: policy.policyID,
                oldPolicyName: policy.name,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };

            expect(ReportUtils.getTitle(archivedPolicyExpenseChat, [])).toBe('Vikings Policy (archived)');

            return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es')
                .then(() => expect(ReportUtils.getTitle(archivedPolicyExpenseChat, [])).toBe('Vikings Policy (archivado)'));
        });
    });
});
