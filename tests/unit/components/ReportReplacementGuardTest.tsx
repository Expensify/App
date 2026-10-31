import {act, cleanup, render, screen} from '@testing-library/react-native';

import ReportReplacementGuard from '@components/ReportReplacementGuard';

import redirectReplacedReport from '@libs/Navigation/helpers/redirectReplacedReport';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/helpers/redirectReplacedReport', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {isNavigationReady: jest.fn(() => Promise.resolve())}}));
jest.mock('@components/FullscreenLoadingIndicator', () => {
    const {View: LoadingView} = jest.requireActual<{View: typeof View}>('react-native');
    return () => <LoadingView testID="replacement-loading" />;
});

const mockMountContent = jest.fn();

function Content() {
    useEffect(() => {
        mockMountContent();
    }, []);
    return <View testID="report-content" />;
}

describe('ReportReplacementGuard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(Navigation.isNavigationReady).mockResolvedValue(undefined);
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(cleanup);

    it('redirects a persisted replacement while offline before mounting report content', async () => {
        // Given a reload retained only the old report's replacement reference, not its in-memory mapping
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}100`, {preexistingReportID: '200'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}200`, {reportID: '200'});
        await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});

        // When browser Forward restores either an expense report or Details for the old ID
        const {rerender} = render(
            <ReportReplacementGuard reportID="100">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then redirect before mounting content that could fetch the deleted report or show Not Here
        expect(redirectReplacedReport).toHaveBeenCalledWith('100', '200');
        expect(screen.getByTestId('replacement-loading')).toBeTruthy();
        expect(mockMountContent).not.toHaveBeenCalled();

        // When navigation replaces the route parameter with the survivor's ID
        rerender(
            <ReportReplacementGuard reportID="200">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the surviving report renders from local data without requiring a network response
        expect(screen.getByTestId('report-content')).toBeTruthy();
        expect(mockMountContent).toHaveBeenCalledTimes(1);
    });

    it('blocks report handlers when browser Back restores a retired report after a reload', async () => {
        // Given the surviving report is cached and the old /r/ report retains only its replacement reference
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1200`, {preexistingReportID: '1300'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1300`, {reportID: '1300'});
        await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        const {rerender} = render(
            <ReportReplacementGuard reportID="1300">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();
        expect(mockMountContent).toHaveBeenCalledTimes(1);

        // When browser Back restores the obsolete report while offline
        rerender(
            <ReportReplacementGuard reportID="1200">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then no report fetch/lifecycle content mounts for the obsolete ID before it redirects
        expect(redirectReplacedReport).toHaveBeenCalledWith('1200', '1300');
        expect(screen.queryByTestId('report-content')).toBeNull();
        expect(mockMountContent).toHaveBeenCalledTimes(1);

        // When navigation points back to the survivor
        rerender(
            <ReportReplacementGuard reportID="1300">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then cached content renders without requiring a server response to the obsolete report
        expect(screen.getByTestId('report-content')).toBeTruthy();
        expect(mockMountContent).toHaveBeenCalledTimes(2);
    });

    it('follows persisted replacement chains again when history restores the original report', async () => {
        // Given two replacements survive locally while no history-specific mapping is needed
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}900`, {preexistingReportID: '1000'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1000`, {preexistingReportID: '1100'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1100`, {reportID: '1100'});
        const {rerender} = render(
            <ReportReplacementGuard reportID="900">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // When navigation follows the first redirect and discovers another persisted reference
        rerender(
            <ReportReplacementGuard reportID="1000">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then each hop uses the stored reference without mounting retired-report content
        expect(redirectReplacedReport).toHaveBeenNthCalledWith(1, '900', '1000');
        expect(redirectReplacedReport).toHaveBeenNthCalledWith(2, '1000', '1100');
        expect(mockMountContent).not.toHaveBeenCalled();

        // When the survivor opens and a later Forward restores the original temporary report again
        rerender(
            <ReportReplacementGuard reportID="1100">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('report-content')).toBeTruthy();
        rerender(
            <ReportReplacementGuard reportID="900">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the reference is still available rather than being consumed by the first redirect
        expect(redirectReplacedReport).toHaveBeenNthCalledWith(3, '900', '1000');
        expect(screen.queryByTestId('report-content')).toBeNull();
    });

    it('lets missing reports reach the existing not-found handling instead of redirecting', async () => {
        // Given the route refers to a genuinely missing report with no replacement reference
        // When the guard finishes reading that key
        render(
            <ReportReplacementGuard reportID="300">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the original screen owns its loading/access decision and no destination is guessed
        expect(screen.getByTestId('report-content')).toBeTruthy();
        expect(redirectReplacedReport).not.toHaveBeenCalled();
    });

    it('does not redirect a real report merely because it has a preexistingReportID field', async () => {
        // Given a full report belongs to the existing replacement handler, not the reference-only path
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}400`, {reportID: '400', preexistingReportID: '500'});

        // When it is opened
        render(
            <ReportReplacementGuard reportID="400">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then this guard leaves the established full-report replacement behavior alone
        expect(screen.getByTestId('report-content')).toBeTruthy();
        expect(redirectReplacedReport).not.toHaveBeenCalled();
    });

    it('does not get stuck redirecting an identity reference', async () => {
        // Given a malformed reference points to the same report instead of a replacement
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}800`, {preexistingReportID: '800'});

        // When the route is opened
        render(
            <ReportReplacementGuard reportID="800">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then existing missing-report handling can run instead of showing an endless redirect spinner
        expect(screen.getByTestId('report-content')).toBeTruthy();
        expect(redirectReplacedReport).not.toHaveBeenCalled();
    });

    it('cancels a delayed redirect when the screen unmounts before navigation is ready', async () => {
        // Given a persisted reference was read before the navigation container became ready
        let resolveNavigationReady: (() => void) | undefined;
        jest.mocked(Navigation.isNavigationReady).mockReturnValue(
            new Promise<void>((resolve) => {
                resolveNavigationReady = resolve;
            }),
        );
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}600`, {preexistingReportID: '700'});
        const {unmount} = render(
            <ReportReplacementGuard reportID="600">
                <Content />
            </ReportReplacementGuard>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the screen closes before readiness resolves
        unmount();
        await act(async () => {
            resolveNavigationReady?.();
            await Promise.resolve();
        });

        // Then the stale screen cannot redirect a later navigation state
        expect(redirectReplacedReport).not.toHaveBeenCalled();
        expect(mockMountContent).not.toHaveBeenCalled();
    });
});
