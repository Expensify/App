import AgentZeroOptimisticStore from '@libs/AgentZeroOptimisticStore';
import AgentZeroReasoningStore from '@libs/AgentZeroReasoningStore';

const REPORT = '1001';
const AGENT_A = 111;
const AGENT_B = 222;

describe('AgentZeroOptimisticStore (per-agent keying)', () => {
    afterEach(() => {
        AgentZeroOptimisticStore.clear(REPORT, AGENT_A);
        AgentZeroOptimisticStore.clear(REPORT, AGENT_B);
    });

    it('tracks each agent in a report independently', () => {
        AgentZeroOptimisticStore.increment(REPORT, AGENT_A, 'baseline-A');
        expect(AgentZeroOptimisticStore.getEntry(REPORT, AGENT_A)?.count).toBe(1);
        expect(AgentZeroOptimisticStore.getEntry(REPORT, AGENT_B)).toBeUndefined();
    });

    it('keeps the original baseline and bumps the count on repeat kickoffs', () => {
        AgentZeroOptimisticStore.increment(REPORT, AGENT_A, 'baseline-A');
        AgentZeroOptimisticStore.increment(REPORT, AGENT_A, 'baseline-A-2');
        const entry = AgentZeroOptimisticStore.getEntry(REPORT, AGENT_A);
        expect(entry?.count).toBe(2);
        expect(entry?.baselineActionID).toBe('baseline-A');
    });

    it('clears only the targeted agent', () => {
        AgentZeroOptimisticStore.increment(REPORT, AGENT_A, null);
        AgentZeroOptimisticStore.increment(REPORT, AGENT_B, null);
        AgentZeroOptimisticStore.clear(REPORT, AGENT_A);
        expect(AgentZeroOptimisticStore.getEntry(REPORT, AGENT_A)).toBeUndefined();
        expect(AgentZeroOptimisticStore.getEntry(REPORT, AGENT_B)?.count).toBe(1);
    });

    it('merges messages from two predicted threads when the server answers both in one report', () => {
        // Given two messages were tracked under the different threads the client predicted for them.
        const SERVER_REPORT = '3001';
        AgentZeroOptimisticStore.addTurn(REPORT, AGENT_A, null, {questionReportActionID: 'first', responseReportActionID: 'first-reply'});
        AgentZeroOptimisticStore.addTurn('1002', AGENT_A, null, {questionReportActionID: 'second', responseReportActionID: 'second-reply'});
        const latestStartedAt = AgentZeroOptimisticStore.getEntry('1002', AGENT_A)?.startedAt;

        // When the server reports both runs in the same report, and repeats one of those decisions.
        AgentZeroOptimisticStore.reconcile({reportID: SERVER_REPORT, reportActionID: 'first', isProcessing: true});
        AgentZeroOptimisticStore.reconcile({reportID: SERVER_REPORT, reportActionID: 'second', isProcessing: true});
        AgentZeroOptimisticStore.reconcile({reportID: SERVER_REPORT, reportActionID: 'first', isProcessing: true});

        // Then that report waits for both messages once each, and the safety window still counts from the latest send.
        const entry = AgentZeroOptimisticStore.getEntry(SERVER_REPORT, AGENT_A);
        expect(entry?.turns.map((turn) => turn.questionReportActionID)).toEqual(['first', 'second']);
        expect(entry?.startedAt).toBe(latestStartedAt);
        expect(AgentZeroOptimisticStore.getEntry(REPORT, AGENT_A)).toBeUndefined();
        expect(AgentZeroOptimisticStore.getEntry('1002', AGENT_A)).toBeUndefined();
        AgentZeroOptimisticStore.clear(SERVER_REPORT, AGENT_A);
    });

    it('notifies subscribers with the report and agent that changed', () => {
        const listener = jest.fn();
        const unsubscribe = AgentZeroOptimisticStore.subscribe(listener);
        AgentZeroOptimisticStore.increment(REPORT, AGENT_A, null);
        expect(listener).toHaveBeenCalledWith(REPORT, AGENT_A);
        unsubscribe();
    });
});

describe('AgentZeroReasoningStore (per-agent keying)', () => {
    afterEach(() => {
        AgentZeroReasoningStore.clearReportReasoning(REPORT);
    });

    it('stores reasoning history per agent', () => {
        AgentZeroReasoningStore.addReasoning(REPORT, AGENT_A, {reasoning: 'A thinks', agentZeroRequestID: 'req-A', loopCount: 1});
        AgentZeroReasoningStore.addReasoning(REPORT, AGENT_B, {reasoning: 'B thinks', agentZeroRequestID: 'req-B', loopCount: 1});
        expect(AgentZeroReasoningStore.getReasoningHistory(REPORT, AGENT_A).map((entry) => entry.reasoning)).toEqual(['A thinks']);
        expect(AgentZeroReasoningStore.getReasoningHistory(REPORT, AGENT_B).map((entry) => entry.reasoning)).toEqual(['B thinks']);
    });

    it('resets an agent history when a new agentZeroRequestID arrives', () => {
        AgentZeroReasoningStore.addReasoning(REPORT, AGENT_A, {reasoning: 'old', agentZeroRequestID: 'req-1', loopCount: 1});
        AgentZeroReasoningStore.addReasoning(REPORT, AGENT_A, {reasoning: 'new', agentZeroRequestID: 'req-2', loopCount: 1});
        expect(AgentZeroReasoningStore.getReasoningHistory(REPORT, AGENT_A).map((entry) => entry.reasoning)).toEqual(['new']);
    });

    it('clears only the targeted agent', () => {
        AgentZeroReasoningStore.addReasoning(REPORT, AGENT_A, {reasoning: 'A thinks', agentZeroRequestID: 'req-A', loopCount: 1});
        AgentZeroReasoningStore.addReasoning(REPORT, AGENT_B, {reasoning: 'B thinks', agentZeroRequestID: 'req-B', loopCount: 1});
        AgentZeroReasoningStore.clearReasoning(REPORT, AGENT_A);
        expect(AgentZeroReasoningStore.getReasoningHistory(REPORT, AGENT_A)).toEqual([]);
        expect(AgentZeroReasoningStore.getReasoningHistory(REPORT, AGENT_B).map((entry) => entry.reasoning)).toEqual(['B thinks']);
    });

    it('clears every agent in a report on clearReportReasoning', () => {
        AgentZeroReasoningStore.addReasoning(REPORT, AGENT_A, {reasoning: 'A thinks', agentZeroRequestID: 'req-A', loopCount: 1});
        AgentZeroReasoningStore.addReasoning(REPORT, AGENT_B, {reasoning: 'B thinks', agentZeroRequestID: 'req-B', loopCount: 1});
        AgentZeroReasoningStore.clearReportReasoning(REPORT);
        expect(AgentZeroReasoningStore.getReasoningHistory(REPORT, AGENT_A)).toEqual([]);
        expect(AgentZeroReasoningStore.getReasoningHistory(REPORT, AGENT_B)).toEqual([]);
    });
});
