import {clearPendingRHPWidth, consumePendingRHPWidth, markPendingRHPWidth} from '@components/WideRHPContextProvider/pendingRHPWidths';

import CONST from '@src/CONST';

/** Every report the tests leave a width for. The widths live in module state, which outlives a test. */
const TEST_REPORT_IDS = ['report1', 'report2', 'thread1'];

describe('pendingRHPWidths', () => {
    afterEach(() => {
        jest.useRealTimers();
        for (const reportID of TEST_REPORT_IDS) {
            clearPendingRHPWidth(reportID);
        }
    });

    it('hands a width to the screen it was left for', () => {
        // Given a press that left a width for the report it is opening
        markPendingRHPWidth('report1', 'super-wide');

        // When that report's screen asks for it
        // Then it gets it
        expect(consumePendingRHPWidth('report1')).toBe('super-wide');
    });

    it('hands it over once, so a screen mounting later for the same report cannot act on it again', () => {
        // Given a width already taken by the screen the press opened
        markPendingRHPWidth('report1', 'super-wide');
        expect(consumePendingRHPWidth('report1')).toBe('super-wide');

        // When the same report is opened again later, by a press that left nothing
        // Then nothing is waiting for it
        expect(consumePendingRHPWidth('report1')).toBeUndefined();
    });

    it('says nothing to a report no press left a width for', () => {
        // Given a press that left a width for a different report
        markPendingRHPWidth('report1', 'wide');

        // When a screen opens for a report nothing was left for
        // Then it gets nothing, so it opens at its own width
        expect(consumePendingRHPWidth('report2')).toBeUndefined();
    });

    it('holds one width per report, since opening a report and cascading into its transaction is a single press', () => {
        // Given a press that leaves a width for the report and another for the transaction thread it cascades into
        markPendingRHPWidth('report1', 'super-wide');
        markPendingRHPWidth('thread1', 'wide');

        // When each screen opens in turn
        // Then each gets the width left for it
        expect(consumePendingRHPWidth('report1')).toBe('super-wide');
        expect(consumePendingRHPWidth('thread1')).toBe('wide');
    });

    it('lets the latest press win, since the screen that takes a width keeps it as its own floor', () => {
        // Given two presses that each left a width for the same report before its screen opened
        markPendingRHPWidth('report1', 'wide');
        markPendingRHPWidth('report1', 'super-wide');

        // When the report's screen asks for it
        // Then it gets the latest, since a stale width would stay with it as its floor
        expect(consumePendingRHPWidth('report1')).toBe('super-wide');
    });

    it('withholds a width whose press opened nothing in time, so a later visit is not widened by it', () => {
        // Given a press that left a width for a screen that never opened
        jest.useFakeTimers();
        markPendingRHPWidth('report1', 'super-wide');

        // When the report is opened long after that press
        jest.advanceTimersByTime(CONST.PENDING_RHP_WIDTH_WINDOW);

        // Then the width has expired
        expect(consumePendingRHPWidth('report1')).toBeUndefined();
    });

    it('still hands over a width left for a cascade that has not landed yet', () => {
        // Given the cascade, which opens its second screen a fraction of a second after the press
        jest.useFakeTimers();
        markPendingRHPWidth('thread1', 'wide');

        // When the transaction thread opens just before the width would expire
        jest.advanceTimersByTime(CONST.PENDING_RHP_WIDTH_WINDOW - 1);

        // Then it still gets the width left for it
        expect(consumePendingRHPWidth('thread1')).toBe('wide');
    });

    it('drops a width whose press was abandoned', () => {
        // Given a press that left a width for the report it is opening
        markPendingRHPWidth('report1', 'super-wide');

        // When the press is abandoned, as when the user leaves before the cascade opens its screen
        clearPendingRHPWidth('report1');

        // Then nothing is waiting, so a later visit to the report is not widened by it
        expect(consumePendingRHPWidth('report1')).toBeUndefined();
    });
});
