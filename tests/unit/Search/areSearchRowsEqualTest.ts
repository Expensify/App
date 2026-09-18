import areSearchRowsEqual from '@components/Search/hooks/areSearchRowsEqual';

const participant = {accountID: 1, displayName: 'Ada', avatar: 'https://example.com/a.png', login: 'ada@example.com'};

describe('areSearchRowsEqual', () => {
    it('treats the same data as equal and a changed field as different', () => {
        const row = {keyForList: '1', amount: 100, merchant: 'Cafe', from: participant};
        expect(areSearchRowsEqual(row, {...row})).toBe(true);
        expect(areSearchRowsEqual(row, {...row, amount: 150})).toBe(false);
        expect(areSearchRowsEqual(row, {...row, merchant: 'Bar'})).toBe(false);
    });

    it('counts a key holding undefined as absent', () => {
        expect(areSearchRowsEqual({keyForList: '1', amount: 100, pendingAction: undefined}, {keyForList: '1', amount: 100})).toBe(true);
        expect(areSearchRowsEqual({keyForList: '1', amount: 100}, {keyForList: '1', amount: 100, pendingAction: 'delete'})).toBe(false);
        expect(areSearchRowsEqual({keyForList: '1', amount: 100, pendingAction: 'delete'}, {keyForList: '1', amount: 100, pendingAction: undefined})).toBe(false);
    });

    it('ignores participant fields the row does not render', () => {
        const row = {keyForList: '1', from: participant, to: participant};
        const enriched = {
            keyForList: '1',
            from: {...participant, pronouns: 'she/her', timezone: {selected: 'Europe/Warsaw'}, phoneNumber: '+48', validated: true},
            to: {...participant, timezone: {automatic: true}},
        };
        expect(areSearchRowsEqual(row, enriched)).toBe(true);
    });

    it('still sees a change in a rendered participant field', () => {
        const row = {keyForList: '1', from: participant};
        expect(areSearchRowsEqual(row, {keyForList: '1', from: {...participant, displayName: 'Ada L.'}})).toBe(false);
        expect(areSearchRowsEqual(row, {keyForList: '1', from: {...participant, avatar: 'https://example.com/b.png'}})).toBe(false);
        expect(areSearchRowsEqual(row, {keyForList: '1', from: {...participant, accountID: 2}})).toBe(false);
    });

    it('applies the participant rule to the transactions nested in a group row', () => {
        const group = {keyForList: 'r1', reportID: 'r1', transactions: [{transactionID: 't1', from: participant}]};
        const enrichedGroup = {keyForList: 'r1', reportID: 'r1', transactions: [{transactionID: 't1', from: {...participant, pronouns: 'they/them'}}]};
        const changedGroup = {keyForList: 'r1', reportID: 'r1', transactions: [{transactionID: 't1', from: {...participant, displayName: 'Grace'}}]};
        expect(areSearchRowsEqual(group, enrichedGroup)).toBe(true);
        expect(areSearchRowsEqual(group, changedGroup)).toBe(false);
    });

    it('does not mistake other from/to fields for participants', () => {
        expect(areSearchRowsEqual({keyForList: '1', from: '2024-01-01', to: '2024-01-31'}, {keyForList: '1', from: '2024-01-01', to: '2024-02-01'})).toBe(false);
    });

    it('compares arrays by position and length', () => {
        expect(areSearchRowsEqual({keyForList: '1', tags: ['a', 'b']}, {keyForList: '1', tags: ['a', 'b']})).toBe(true);
        expect(areSearchRowsEqual({keyForList: '1', tags: ['a', 'b']}, {keyForList: '1', tags: ['b', 'a']})).toBe(false);
        expect(areSearchRowsEqual({keyForList: '1', tags: ['a']}, {keyForList: '1', tags: ['a', 'b']})).toBe(false);
    });
});
