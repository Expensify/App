import {addReasoning, clearReasoning, getReasoningHistory, getReasoningState, subscribe} from '@libs/ConciergeReasoningStore';

describe('ConciergeReasoningStore', () => {
    beforeEach(() => {
        clearReasoning('test-report-1');
        clearReasoning('test-report-2');
    });

    describe('addReasoning', () => {
        it('should add reasoning entry for a report', () => {
            addReasoning('test-report-1', {
                reasoning: 'Looking at policy settings...',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            const history = getReasoningHistory('test-report-1');
            expect(history).toHaveLength(1);
            expect(history[0]).toBe('Looking at policy settings...');
        });

        it('should ignore empty reasoning', () => {
            addReasoning('test-report-1', {
                reasoning: '',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            const history = getReasoningHistory('test-report-1');
            expect(history).toHaveLength(0);
        });

        it('should reset state when agentZeroRequestID changes', () => {
            addReasoning('test-report-1', {
                reasoning: 'First request reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            addReasoning('test-report-1', {
                reasoning: 'Second request reasoning',
                agentZeroRequestID: 'request-456',
                loopCount: 1,
            });

            const history = getReasoningHistory('test-report-1');
            expect(history).toHaveLength(1);
            expect(history[0]).toBe('Second request reasoning');
        });

        it('should ignore duplicate loopCount entries', () => {
            addReasoning('test-report-1', {
                reasoning: 'First reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            addReasoning('test-report-1', {
                reasoning: 'Duplicate reasoning for same loop',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            const history = getReasoningHistory('test-report-1');
            expect(history).toHaveLength(1);
            expect(history[0]).toBe('First reasoning');
        });

        it('should append reasoning entries in order by loopCount', () => {
            addReasoning('test-report-1', {
                reasoning: 'Loop 1 reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            addReasoning('test-report-1', {
                reasoning: 'Loop 2 reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 2,
            });

            addReasoning('test-report-1', {
                reasoning: 'Loop 3 reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 3,
            });

            const history = getReasoningHistory('test-report-1');
            expect(history).toHaveLength(3);
            expect(history).toEqual(['Loop 1 reasoning', 'Loop 2 reasoning', 'Loop 3 reasoning']);
        });

        it('should ignore out-of-order loopCount entries', () => {
            addReasoning('test-report-1', {
                reasoning: 'Loop 2 reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 2,
            });

            addReasoning('test-report-1', {
                reasoning: 'Late loop 1 reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            const history = getReasoningHistory('test-report-1');
            expect(history).toHaveLength(1);
            expect(history[0]).toBe('Loop 2 reasoning');
        });
    });

    describe('clearReasoning', () => {
        it('should clear all reasoning for a report', () => {
            addReasoning('test-report-1', {
                reasoning: 'Some reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            clearReasoning('test-report-1');

            const history = getReasoningHistory('test-report-1');
            expect(history).toHaveLength(0);
        });

        it('should not affect other reports', () => {
            addReasoning('test-report-1', {
                reasoning: 'Report 1 reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            addReasoning('test-report-2', {
                reasoning: 'Report 2 reasoning',
                agentZeroRequestID: 'request-456',
                loopCount: 1,
            });

            clearReasoning('test-report-1');

            expect(getReasoningHistory('test-report-1')).toHaveLength(0);
            expect(getReasoningHistory('test-report-2')).toHaveLength(1);
        });
    });

    describe('getReasoningState', () => {
        it('should return undefined for unknown reports', () => {
            const state = getReasoningState('unknown-report');
            expect(state).toBeUndefined();
        });

        it('should return state with agentZeroRequestID and entries', () => {
            addReasoning('test-report-1', {
                reasoning: 'Test reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            const state = getReasoningState('test-report-1');
            expect(state).toBeDefined();
            expect(state?.agentZeroRequestID).toBe('request-123');
            expect(state?.entries).toHaveLength(1);
            expect(state?.entries[0].reasoning).toBe('Test reasoning');
            expect(state?.entries[0].loopCount).toBe(1);
        });
    });

    describe('subscribe', () => {
        it('should notify listeners when reasoning is added', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            addReasoning('test-report-1', {
                reasoning: 'New reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith('test-report-1', expect.objectContaining({
                agentZeroRequestID: 'request-123',
            }));

            unsubscribe();
        });

        it('should notify listeners when reasoning is cleared', () => {
            addReasoning('test-report-1', {
                reasoning: 'Some reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            clearReasoning('test-report-1');

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith('test-report-1', undefined);

            unsubscribe();
        });

        it('should not notify after unsubscribe', () => {
            const listener = jest.fn();
            const unsubscribe = subscribe(listener);

            unsubscribe();

            addReasoning('test-report-1', {
                reasoning: 'New reasoning',
                agentZeroRequestID: 'request-123',
                loopCount: 1,
            });

            expect(listener).not.toHaveBeenCalled();
        });
    });
});
