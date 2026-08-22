import optimisticAgentAccountIDMappingEntriesConfig from '@libs/actions/OnyxDerived/configs/optimisticAgentAccountIDMappingEntries';

describe('optimisticAgentAccountIDMappingEntries', () => {
    const optimisticAccountID = '111';
    const realAccountID = 222;
    const createdAt = 1700000000000;

    it('returns an empty object when there is no mapping', () => {
        expect(optimisticAgentAccountIDMappingEntriesConfig.compute([undefined, undefined], {})).toEqual({});
    });

    it('combines a mapping entry with its createdAt timestamp', () => {
        const result = optimisticAgentAccountIDMappingEntriesConfig.compute([{[optimisticAccountID]: realAccountID}, {[optimisticAccountID]: createdAt}], {});

        expect(result).toEqual({[optimisticAccountID]: {realAccountID, createdAt}});
    });

    it('leaves createdAt undefined when the timestamp has not arrived yet', () => {
        const result = optimisticAgentAccountIDMappingEntriesConfig.compute([{[optimisticAccountID]: realAccountID}, undefined], {});

        expect(result).toEqual({[optimisticAccountID]: {realAccountID, createdAt: undefined}});
    });

    it('ignores a createdAt entry for an accountID with no mapping entry', () => {
        const otherOptimisticAccountID = '999';
        const result = optimisticAgentAccountIDMappingEntriesConfig.compute([{[optimisticAccountID]: realAccountID}, {[otherOptimisticAccountID]: createdAt}], {});

        expect(result).toEqual({[optimisticAccountID]: {realAccountID, createdAt: undefined}});
    });
});
