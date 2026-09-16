import shouldFollowActionBadgeTarget from '@pages/inbox/report/shouldFollowActionBadgeTarget';

const BASE_PARAMS = {
    isProduction: false,
    actionTargetReportActionID: '200',
    prevActionTargetReportActionID: '100',
    actionBadgeTargetIndex: 2,
    prevActionBadgeTargetIndex: 5,
};

describe('shouldFollowActionBadgeTarget', () => {
    it('follows the target when it advances to a newer (lower-index) preview', () => {
        expect(shouldFollowActionBadgeTarget(BASE_PARAMS)).toBe(true);
    });

    it('does not follow when the target moves to an older (higher-index) preview, e.g. while paginating', () => {
        expect(shouldFollowActionBadgeTarget({...BASE_PARAMS, actionBadgeTargetIndex: 7})).toBe(false);
    });

    it('does not follow when the target index is unchanged', () => {
        expect(shouldFollowActionBadgeTarget({...BASE_PARAMS, actionBadgeTargetIndex: 5})).toBe(false);
    });

    it('does not follow in production', () => {
        expect(shouldFollowActionBadgeTarget({...BASE_PARAMS, isProduction: true})).toBe(false);
    });

    it('does not follow when the target id did not change', () => {
        expect(shouldFollowActionBadgeTarget({...BASE_PARAMS, actionTargetReportActionID: '100'})).toBe(false);
    });

    it('does not follow when there is no current target', () => {
        expect(shouldFollowActionBadgeTarget({...BASE_PARAMS, actionTargetReportActionID: undefined})).toBe(false);
    });

    it('does not follow when there is no previous target', () => {
        expect(shouldFollowActionBadgeTarget({...BASE_PARAMS, prevActionTargetReportActionID: undefined})).toBe(false);
    });

    it('does not follow when the current target is no longer rendered', () => {
        expect(shouldFollowActionBadgeTarget({...BASE_PARAMS, actionBadgeTargetIndex: -1})).toBe(false);
    });

    it('does not follow when the previous target is no longer rendered', () => {
        expect(shouldFollowActionBadgeTarget({...BASE_PARAMS, prevActionBadgeTargetIndex: -1})).toBe(false);
    });
});
