/**
 * Measures what an ordinary chat update costs through the OUTSTANDING_REPORTS_BY_POLICY_ID derived value. Every report
 * write recomputes it, and the value is only skipped (no Onyx write, no subscriber notified) when the config hands back
 * the previous reference. Each scenario stores an account with outstanding expense reports, mounts components that read
 * the derived value (the whole map, and one workspace's reports through a selector), then sends chat messages to rooms
 * that have nothing to do with any expense report.
 *
 * Run with: npm run perf-local -- --testMatch '<rootDir>/tests/perf-local/OutstandingReportsByPolicyID.perf-local.ts'
 * It prints one line per scenario, so it also runs under plain Jest:
 * npx jest --testMatch '<rootDir>/tests/perf-local/OutstandingReportsByPolicyID.perf-local.ts' --runInBand
 */
import {act, render} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OutstandingReportsByPolicyIDDerivedValue, Report} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.setTimeout(30 * 60 * 1000);

const POLICY_COUNT = 10;
const CHAT_REPORT_COUNT = 1_000;
const MESSAGES = 20;
const RUNS = 3;

const SCENARIOS = [{outstandingReports: 10}, {outstandingReports: 100}, {outstandingReports: 500}, {outstandingReports: 2_000}];

const renderCounts = {wholeMap: 0, oneWorkspace: 0};

function WholeMapConsumer() {
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    renderCounts.wholeMap++;
    return React.createElement(React.Fragment, null, Object.keys(outstandingReportsByPolicyID ?? {}).length);
}

const firstWorkspaceSelector = (value: OutstandingReportsByPolicyIDDerivedValue | undefined): OnyxCollection<Report> | undefined => value?.policy0;

function OneWorkspaceConsumer() {
    const [outstandingReports] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {selector: firstWorkspaceSelector});
    renderCounts.oneWorkspace++;
    return React.createElement(React.Fragment, null, Object.keys(outstandingReports ?? {}).length);
}

function buildReports(outstandingReports: number): ReportCollectionDataSet {
    const reports: ReportCollectionDataSet = {};
    for (let index = 0; index < outstandingReports; index++) {
        const reportID = String(100_000 + index);
        reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
            reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: `policy${index % POLICY_COUNT}`,
            stateNum: index % 2 ? CONST.REPORT.STATE_NUM.SUBMITTED : CONST.REPORT.STATE_NUM.OPEN,
            statusNum: index % 2 ? CONST.REPORT.STATUS_NUM.SUBMITTED : CONST.REPORT.STATUS_NUM.OPEN,
            reportName: `Expense Report ${index}`,
            total: -1_000,
            currency: CONST.CURRENCY.USD,
            ownerAccountID: 1,
            managerID: 2,
        };
    }
    for (let index = 0; index < CHAT_REPORT_COUNT; index++) {
        const reportID = String(500_000 + index);
        reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
            reportID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            policyID: `policy${index % POLICY_COUNT}`,
            reportName: `#room-${index}`,
            lastMessageText: 'Hello',
        };
    }
    return reports;
}

function median(values: number[]) {
    return [...values].sort((first, second) => first - second).at(Math.floor(values.length / 2)) ?? 0;
}

describe('OUTSTANDING_REPORTS_BY_POLICY_ID on chat messages', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
    });

    test.each(SCENARIOS)('$outstandingReports outstanding expense reports', async ({outstandingReports}) => {
        await act(async () => {
            await Onyx.multiSet(buildReports(outstandingReports));
            await waitForBatchedUpdates();
        });
        const view = render(React.createElement(React.Fragment, null, React.createElement(WholeMapConsumer), React.createElement(OneWorkspaceConsumer)));
        await act(async () => {
            await waitForBatchedUpdates();
        });

        const setSpy = jest.spyOn(Onyx, 'set');
        const durations: number[] = [];
        let derivedWrites = 0;
        let wholeMapRenders = 0;
        let oneWorkspaceRenders = 0;
        let message = 0;

        for (let run = 0; run < RUNS; run++) {
            setSpy.mockClear();
            renderCounts.wholeMap = 0;
            renderCounts.oneWorkspace = 0;
            const start = performance.now();
            for (let index = 0; index < MESSAGES; index++) {
                message++;
                const reportID = String(500_000 + (message % CHAT_REPORT_COUNT));
                // A message lands in a room: only the room's last message fields change
                await act(async () => {
                    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                        lastMessageText: `Message ${message}`,
                        lastVisibleActionCreated: `2026-11-20 10:00:${String(message % 60).padStart(2, '0')}.000`,
                    });
                    await waitForBatchedUpdates();
                });
            }
            durations.push(performance.now() - start);
            derivedWrites = setSpy.mock.calls.filter(([key]) => key === ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID).length;
            wholeMapRenders = renderCounts.wholeMap;
            oneWorkspaceRenders = renderCounts.oneWorkspace;
        }

        const storedValue = await Onyx.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
        const storedKilobytes = JSON.stringify(storedValue ?? {}).length / 1024;
        view.unmount();

        // Written to stdout directly so the numbers show up even when Jest runs with --silent.
        process.stdout.write(
            `[OutstandingReportsBench] outstanding=${outstandingReports} messages=${MESSAGES} median=${median(durations).toFixed(1)}ms runs=[${durations.map((duration) => duration.toFixed(1)).join(', ')}] derivedWrites=${derivedWrites} wholeMapRenders=${wholeMapRenders} oneWorkspaceRenders=${oneWorkspaceRenders} storedKB=${storedKilobytes.toFixed(0)}\n`,
        );
        expect(storedValue).toBeDefined();
    });
});
