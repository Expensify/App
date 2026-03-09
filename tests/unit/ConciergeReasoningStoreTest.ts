import ConciergeReasoningStore from '@libs/ConciergeReasoningStore';
import type {ReasoningData, ReasoningEntry} from '@libs/ConciergeReasoningStore';

describe('ConciergeReasoningStore', () => {
    const reportID1 = '123';
    const reportID2 = '456';
    const agentZeroRequestID1 = 'request-1';
    const agentZeroRequestID2 = 'request-2';

    beforeEach(() => {
        // Clear all reasoning data before each test
        ConciergeReasoningStore.clearReasoning(reportID1);
        ConciergeReasoningStore.clearReasoning(reportID2);
    });

    describe('addReasoning', () => {
        it('should add a reasoning entry to a report', () => {
            const data: ReasoningData = {
                reasoning: 'Looking at your policy settings',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data);

            const history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toHaveLength(1);
            expect(history.at(0)?.reasoning).toBe('Looking at your policy settings');
            expect(history.at(0)?.loopCount).toBe(1);
            expect(history.at(0)?.timestamp).toBeDefined();
        });

        it('should add multiple reasoning entries in order', () => {
            const data1: ReasoningData = {
                reasoning: 'First reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };
            const data2: ReasoningData = {
                reasoning: 'Second reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 2,
            };
            const data3: ReasoningData = {
                reasoning: 'Third reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 3,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data1);
            ConciergeReasoningStore.addReasoning(reportID1, data2);
            ConciergeReasoningStore.addReasoning(reportID1, data3);

            const history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toHaveLength(3);
            expect(history.at(0)?.reasoning).toBe('First reasoning');
            expect(history.at(1)?.reasoning).toBe('Second reasoning');
            expect(history.at(2)?.reasoning).toBe('Third reasoning');
        });

        it('should ignore empty reasoning strings', () => {
            const data: ReasoningData = {
                reasoning: '',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data);

            const history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toHaveLength(0);
        });

        it('should ignore whitespace-only reasoning strings', () => {
            const data: ReasoningData = {
                reasoning: '   ',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data);

            const history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toHaveLength(0);
        });

        it('should reset state when agentZeroRequestID changes', () => {
            // Add entries for first request
            const data1: ReasoningData = {
                reasoning: 'First request reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };
            const data2: ReasoningData = {
                reasoning: 'First request reasoning 2',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 2,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data1);
            ConciergeReasoningStore.addReasoning(reportID1, data2);

            let history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toHaveLength(2);

            // Add entry with new agentZeroRequestID - should reset
            const data3: ReasoningData = {
                reasoning: 'Second request reasoning',
                agentZeroRequestID: agentZeroRequestID2,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data3);

            history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toHaveLength(1);
            expect(history.at(0)?.reasoning).toBe('Second request reasoning');
            expect(history.at(0)?.loopCount).toBe(1);
        });

        it('should skip duplicate entries with same loopCount and reasoning', () => {
            const data: ReasoningData = {
                reasoning: 'Duplicate reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data);
            ConciergeReasoningStore.addReasoning(reportID1, data);
            ConciergeReasoningStore.addReasoning(reportID1, data);

            const history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toHaveLength(1);
        });

        it('should add entries with same loopCount but different reasoning', () => {
            const data1: ReasoningData = {
                reasoning: 'First reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };
            const data2: ReasoningData = {
                reasoning: 'Second reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data1);
            ConciergeReasoningStore.addReasoning(reportID1, data2);

            const history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toHaveLength(2);
            expect(history.at(0)?.reasoning).toBe('First reasoning');
            expect(history.at(1)?.reasoning).toBe('Second reasoning');
        });

        it('should add entries with same reasoning but different loopCount', () => {
            const data1: ReasoningData = {
                reasoning: 'Same reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };
            const data2: ReasoningData = {
                reasoning: 'Same reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 2,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data1);
            ConciergeReasoningStore.addReasoning(reportID1, data2);

            const history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toHaveLength(2);
            expect(history.at(0)?.loopCount).toBe(1);
            expect(history.at(1)?.loopCount).toBe(2);
        });
    });

    describe('getReasoningHistory', () => {
        it('should return empty array for report with no reasoning', () => {
            const history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toEqual([]);
        });

        it('should return reasoning history for specific report', () => {
            const data1: ReasoningData = {
                reasoning: 'Report 1 reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };
            const data2: ReasoningData = {
                reasoning: 'Report 2 reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data1);
            ConciergeReasoningStore.addReasoning(reportID2, data2);

            const history1 = ConciergeReasoningStore.getReasoningHistory(reportID1);
            const history2 = ConciergeReasoningStore.getReasoningHistory(reportID2);

            expect(history1).toHaveLength(1);
            expect(history1.at(0)?.reasoning).toBe('Report 1 reasoning');
            expect(history2).toHaveLength(1);
            expect(history2.at(0)?.reasoning).toBe('Report 2 reasoning');
        });
    });

    describe('clearReasoning', () => {
        it('should remove all reasoning entries for a report', () => {
            const data1: ReasoningData = {
                reasoning: 'First reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };
            const data2: ReasoningData = {
                reasoning: 'Second reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 2,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data1);
            ConciergeReasoningStore.addReasoning(reportID1, data2);

            let history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toHaveLength(2);

            ConciergeReasoningStore.clearReasoning(reportID1);

            history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toEqual([]);
        });

        it('should only clear reasoning for the specified report', () => {
            const data1: ReasoningData = {
                reasoning: 'Report 1 reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };
            const data2: ReasoningData = {
                reasoning: 'Report 2 reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data1);
            ConciergeReasoningStore.addReasoning(reportID2, data2);

            ConciergeReasoningStore.clearReasoning(reportID1);

            const history1 = ConciergeReasoningStore.getReasoningHistory(reportID1);
            const history2 = ConciergeReasoningStore.getReasoningHistory(reportID2);

            expect(history1).toEqual([]);
            expect(history2).toHaveLength(1);
            expect(history2.at(0)?.reasoning).toBe('Report 2 reasoning');
        });

        it('should handle clearing a report that has no reasoning', () => {
            // Should not throw an error
            expect(() => {
                ConciergeReasoningStore.clearReasoning(reportID1);
            }).not.toThrow();

            const history = ConciergeReasoningStore.getReasoningHistory(reportID1);
            expect(history).toEqual([]);
        });
    });

    describe('subscribe', () => {
        it('should notify listener when reasoning is added', () => {
            const listener = jest.fn();
            const unsubscribe = ConciergeReasoningStore.subscribe(listener);

            const data: ReasoningData = {
                reasoning: 'Test reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith(reportID1, expect.any(Array));

            const callArgs = listener.mock.calls.at(0) as [string, ReasoningEntry[]];
            const [, entries] = callArgs;
            expect(entries).toHaveLength(1);
            expect(entries.at(0)?.reasoning).toBe('Test reasoning');

            unsubscribe();
        });

        it('should notify listener when reasoning is cleared', () => {
            const listener = jest.fn();
            const unsubscribe = ConciergeReasoningStore.subscribe(listener);

            const data: ReasoningData = {
                reasoning: 'Test reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data);
            listener.mockClear();

            ConciergeReasoningStore.clearReasoning(reportID1);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith(reportID1, []);

            unsubscribe();
        });

        it('should notify multiple listeners', () => {
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            const unsubscribe1 = ConciergeReasoningStore.subscribe(listener1);
            const unsubscribe2 = ConciergeReasoningStore.subscribe(listener2);

            const data: ReasoningData = {
                reasoning: 'Test reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data);

            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenCalledTimes(1);

            unsubscribe1();
            unsubscribe2();
        });

        it('should not notify listener after unsubscribe', () => {
            const listener = jest.fn();
            const unsubscribe = ConciergeReasoningStore.subscribe(listener);

            const data: ReasoningData = {
                reasoning: 'Test reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data);
            expect(listener).toHaveBeenCalledTimes(1);

            listener.mockClear();
            unsubscribe();

            const data2: ReasoningData = {
                reasoning: 'Another reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 2,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data2);
            expect(listener).not.toHaveBeenCalled();
        });

        it('should not notify listener for duplicate entries', () => {
            const listener = jest.fn();
            const unsubscribe = ConciergeReasoningStore.subscribe(listener);

            const data: ReasoningData = {
                reasoning: 'Duplicate reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data);
            expect(listener).toHaveBeenCalledTimes(1);

            listener.mockClear();
            ConciergeReasoningStore.addReasoning(reportID1, data);
            expect(listener).not.toHaveBeenCalled();

            unsubscribe();
        });

        it('should not notify listener for empty reasoning', () => {
            const listener = jest.fn();
            const unsubscribe = ConciergeReasoningStore.subscribe(listener);

            const data: ReasoningData = {
                reasoning: '',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data);
            expect(listener).not.toHaveBeenCalled();

            unsubscribe();
        });

        it('should notify listener when state is reset for new agentZeroRequestID', () => {
            const listener = jest.fn();
            const unsubscribe = ConciergeReasoningStore.subscribe(listener);

            // Add first entry
            const data1: ReasoningData = {
                reasoning: 'First request',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };
            ConciergeReasoningStore.addReasoning(reportID1, data1);
            expect(listener).toHaveBeenCalledTimes(1);

            listener.mockClear();

            // Add entry with new request ID
            const data2: ReasoningData = {
                reasoning: 'Second request',
                agentZeroRequestID: agentZeroRequestID2,
                loopCount: 1,
            };
            ConciergeReasoningStore.addReasoning(reportID1, data2);

            expect(listener).toHaveBeenCalledTimes(1);
            const callArgs = listener.mock.calls.at(0) as [string, ReasoningEntry[]];
            const [, entries] = callArgs;
            expect(entries).toHaveLength(1);
            expect(entries.at(0)?.reasoning).toBe('Second request');

            unsubscribe();
        });

        it('should handle multiple unsubscribes safely', () => {
            const listener = jest.fn();
            const unsubscribe = ConciergeReasoningStore.subscribe(listener);

            // Should not throw an error when called multiple times
            expect(() => {
                unsubscribe();
                unsubscribe();
                unsubscribe();
            }).not.toThrow();
        });
    });

    describe('isolation between reports', () => {
        it('should keep reasoning separate for different reports', () => {
            const data1: ReasoningData = {
                reasoning: 'Report 1 - Loop 1',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };
            const data2: ReasoningData = {
                reasoning: 'Report 1 - Loop 2',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 2,
            };
            const data3: ReasoningData = {
                reasoning: 'Report 2 - Loop 1',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data1);
            ConciergeReasoningStore.addReasoning(reportID1, data2);
            ConciergeReasoningStore.addReasoning(reportID2, data3);

            const history1 = ConciergeReasoningStore.getReasoningHistory(reportID1);
            const history2 = ConciergeReasoningStore.getReasoningHistory(reportID2);

            expect(history1).toHaveLength(2);
            expect(history2).toHaveLength(1);
            expect(history1.at(0)?.reasoning).toBe('Report 1 - Loop 1');
            expect(history1.at(1)?.reasoning).toBe('Report 1 - Loop 2');
            expect(history2.at(0)?.reasoning).toBe('Report 2 - Loop 1');
        });

        it('should notify listeners with correct reportID', () => {
            const listener = jest.fn();
            const unsubscribe = ConciergeReasoningStore.subscribe(listener);

            const data1: ReasoningData = {
                reasoning: 'Report 1 reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };
            const data2: ReasoningData = {
                reasoning: 'Report 2 reasoning',
                agentZeroRequestID: agentZeroRequestID1,
                loopCount: 1,
            };

            ConciergeReasoningStore.addReasoning(reportID1, data1);
            ConciergeReasoningStore.addReasoning(reportID2, data2);

            expect(listener).toHaveBeenCalledTimes(2);
            expect(listener).toHaveBeenNthCalledWith(1, reportID1, expect.any(Array));
            expect(listener).toHaveBeenNthCalledWith(2, reportID2, expect.any(Array));

            unsubscribe();
        });
    });
});
