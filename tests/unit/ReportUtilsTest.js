import * as ReportUtils from '../../src/libs/ReportUtils';

describe('ReportUtils', () => {
    describe('getDisplayNamesWithTooltips', () => {
        const participants = [
            {
                displayName: 'Ragnar Lothbrok',
                firstName: 'Ragnar',
                login: 'ragnar@vikings.net',
            },
            {
                login: 'floki@vikings.net',
            },
            {
                displayName: 'Lagertha Lothbrok',
                firstName: 'Lagertha',
                login: 'lagertha@vikings.net',
                pronouns: 'She/her',
            },
            {
                login: '+12223334444@expensify.sms',
            },
        ];

        test('withSingleParticipantReport', () => {
            expect(ReportUtils.getDisplayNamesWithTooltips(participants, false)).toStrictEqual([
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
            expect(ReportUtils.getDisplayNamesWithTooltips(participants, true)).toStrictEqual([
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
});
