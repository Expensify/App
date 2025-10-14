import resolvePendingActionForVisualFeedback from '@libs/PendingActionUtils';
import type {TransactionWithPendingAction} from '@libs/PendingActionUtils';
import CONST from '@src/CONST';

describe('PendingActionUtils', () => {
    describe('resolvePendingActionForVisualFeedback', () => {
        describe('when item has a pending action', () => {
            it('should return UPDATE when itemPendingAction is update', () => {
                const result = resolvePendingActionForVisualFeedback(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                expect(result).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            });

            it('should return ADD when itemPendingAction is add', () => {
                const result = resolvePendingActionForVisualFeedback(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                expect(result).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            });

            it('should return DELETE when itemPendingAction is delete', () => {
                const result = resolvePendingActionForVisualFeedback(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                expect(result).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            });

            it('should return the itemPendingAction even when transactions exist', () => {
                const transactions: TransactionWithPendingAction[] = [
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                ];
                const result = resolvePendingActionForVisualFeedback(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, transactions);
                expect(result).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            });
        });

        describe('when item has no pending action but transactions exist', () => {
            it('should return DELETE when all transactions have DELETE pending action', () => {
                const transactions: TransactionWithPendingAction[] = [
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                ];
                const result = resolvePendingActionForVisualFeedback(undefined, transactions);
                expect(result).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            });

            it('should return undefined when not all transactions have DELETE pending action', () => {
                const transactions: TransactionWithPendingAction[] = [
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                ];
                const result = resolvePendingActionForVisualFeedback(undefined, transactions);
                expect(result).toBeUndefined();
            });

            it('should return undefined when some transactions have no pending action', () => {
                const transactions: TransactionWithPendingAction[] = [
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                    {pendingAction: undefined},
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                ];
                const result = resolvePendingActionForVisualFeedback(undefined, transactions);
                expect(result).toBeUndefined();
            });

            it('should return undefined when transactions array is empty', () => {
                const transactions: TransactionWithPendingAction[] = [];
                const result = resolvePendingActionForVisualFeedback(undefined, transactions);
                expect(result).toBeUndefined();
            });

            it('should return undefined when transactions have various non-DELETE pending actions', () => {
                const transactions: TransactionWithPendingAction[] = [
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                ];
                const result = resolvePendingActionForVisualFeedback(undefined, transactions);
                expect(result).toBeUndefined();
            });
        });

        describe('when item has no pending action and no transactions', () => {
            it('should return undefined when itemPendingAction is undefined and no transactions', () => {
                const result = resolvePendingActionForVisualFeedback(undefined);
                expect(result).toBeUndefined();
            });

            it('should return undefined when itemPendingAction is null and no transactions', () => {
                const result = resolvePendingActionForVisualFeedback(null);
                expect(result).toBeUndefined();
            });

            it('should return undefined when itemPendingAction is undefined and transactions is undefined', () => {
                const result = resolvePendingActionForVisualFeedback(undefined, undefined);
                expect(result).toBeUndefined();
            });
        });

        describe('split expense scenarios', () => {
            it('should NOT return DELETE for split expenses with UPDATE pending action', () => {
                // This is the key test case for the bug fix
                // When splitting expenses offline, itemPendingAction should be 'update'
                // and it should NOT be converted to 'delete'
                const transactions: TransactionWithPendingAction[] = [
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                ];
                const result = resolvePendingActionForVisualFeedback(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, transactions);
                expect(result).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                expect(result).not.toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            });

            it('should return UPDATE for split expenses even with single transaction', () => {
                const transactions: TransactionWithPendingAction[] = [
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                ];
                const result = resolvePendingActionForVisualFeedback(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, transactions);
                expect(result).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            });
        });

        describe('edge cases', () => {
            it('should handle null itemPendingAction correctly', () => {
                const result = resolvePendingActionForVisualFeedback(null);
                expect(result).toBeUndefined();
            });

            it('should handle single transaction with DELETE pending action', () => {
                const transactions: TransactionWithPendingAction[] = [
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                ];
                const result = resolvePendingActionForVisualFeedback(undefined, transactions);
                expect(result).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            });

            it('should prioritize itemPendingAction over transaction pending actions', () => {
                const transactions: TransactionWithPendingAction[] = [
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                    {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                ];
                // Even though all transactions have DELETE, if item has ADD, return ADD
                const result = resolvePendingActionForVisualFeedback(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, transactions);
                expect(result).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            });

            it('should handle transactions with only undefined pending actions', () => {
                const transactions: TransactionWithPendingAction[] = [
                    {pendingAction: undefined},
                    {pendingAction: undefined},
                ];
                const result = resolvePendingActionForVisualFeedback(undefined, transactions);
                expect(result).toBeUndefined();
            });
        });
    });
});
