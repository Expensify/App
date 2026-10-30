import {render, screen} from '@testing-library/react-native';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

import ReportNonEssentialsDeferredMount from '@pages/inbox/ReportNonEssentialsDeferredMount';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import createTransitionTrackerHarness from '../utils/TransitionTrackerTestUtils';

type PendingAction = {followUpAction: string; reportID?: string} | null;

const mockGetPendingSubmitFollowUpAction = jest.fn<PendingAction, []>();

jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    getPendingSubmitFollowUpAction: () => mockGetPendingSubmitFollowUpAction(),
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(),
}));

const transitionTracker = createTransitionTrackerHarness();

const OPEN_REPORT_AFTER_SUBMIT = {
    followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT,
    reportID: 'report-1',
};

function buildDeferredMount(reportID: string | undefined) {
    return (
        <ReportNonEssentialsDeferredMount
            reportID={reportID}
            placeholder={<View testID="placeholder" />}
        >
            <View testID="non-essentials" />
        </ReportNonEssentialsDeferredMount>
    );
}

function renderDeferredMount(reportID: string | undefined) {
    return render(buildDeferredMount(reportID));
}

describe('ReportNonEssentialsDeferredMount', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        transitionTracker.install();
    });

    it('shows the placeholder until the upcoming transition ends when the report opens after a submit', () => {
        // Given a submit that dismisses the modal and opens report-1
        mockGetPendingSubmitFollowUpAction.mockReturnValue(OPEN_REPORT_AFTER_SUBMIT);

        // When report-1 mounts its non-essential UI
        renderDeferredMount('report-1');

        // Then only the placeholder renders, and the mount waits for the navigation transition that is about to start
        expect(screen.getByTestId('placeholder')).toBeTruthy();
        expect(screen.queryByTestId('non-essentials')).toBeNull();
        expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));

        // When the transition ends
        transitionTracker.firePendingCallbacks();

        // Then the non-essential UI replaces the placeholder
        expect(screen.getByTestId('non-essentials')).toBeTruthy();
        expect(screen.queryByTestId('placeholder')).toBeNull();
    });

    it('keeps deferring after the pending action is cleared', () => {
        // Given a report that mounted while its submit follow-up action was pending
        mockGetPendingSubmitFollowUpAction.mockReturnValue(OPEN_REPORT_AFTER_SUBMIT);
        const {rerender} = renderDeferredMount('report-1');

        // When the pending action is cleared on focus and the report re-renders before the transition ends
        mockGetPendingSubmitFollowUpAction.mockReturnValue(null);
        rerender(buildDeferredMount('report-1'));

        // Then the deferral is not cut short, because the condition is read once at mount
        expect(screen.getByTestId('placeholder')).toBeTruthy();
        expect(screen.queryByTestId('non-essentials')).toBeNull();

        // When the transition ends
        transitionTracker.firePendingCallbacks();

        // Then the non-essential UI still mounts
        expect(screen.getByTestId('non-essentials')).toBeTruthy();
    });

    it('cancels the transition wait when the report unmounts while deferring', () => {
        // Given a report that is deferring its non-essential UI
        mockGetPendingSubmitFollowUpAction.mockReturnValue(OPEN_REPORT_AFTER_SUBMIT);
        const {unmount} = renderDeferredMount('report-1');

        // When the report unmounts before the transition ends
        unmount();

        // Then the pending wait is cancelled so it does not update an unmounted tree
        expect(transitionTracker.cancel).toHaveBeenCalled();
    });

    it.each([
        ['the pending action only dismisses the modal', {followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID: 'report-1'}, 'report-1'],
        ['the pending action opens a different report', {followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, reportID: 'report-2'}, 'report-1'],
        ['there is no pending action', null, 'report-1'],
        ['the route has no reportID', OPEN_REPORT_AFTER_SUBMIT, undefined],
    ])('renders children right away when %s', (_, pending: PendingAction, reportID: string | undefined) => {
        // Given a pending action and route that do not match opening this report after a submit
        mockGetPendingSubmitFollowUpAction.mockReturnValue(pending);

        // When the report mounts its non-essential UI
        renderDeferredMount(reportID);

        // Then there is nothing to defer for, so the UI mounts with the report and no transition wait is scheduled
        expect(screen.getByTestId('non-essentials')).toBeTruthy();
        expect(screen.queryByTestId('placeholder')).toBeNull();
        expect(TransitionTracker.runAfterTransitions).not.toHaveBeenCalled();
    });
});
