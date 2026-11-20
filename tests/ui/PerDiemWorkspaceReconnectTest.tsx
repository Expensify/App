/** Regression coverage for resolving a per diem workspace before its rates have loaded. */
import {act, render, screen} from '@testing-library/react-native';

import useNetwork from '@hooks/useNetwork';

import {fetchPerDiemRates} from '@libs/actions/Policy/PerDiem';
import {getInitialPerDiemTargetReport} from '@libs/IOUUtils';

import BaseRequestStepWorkspace from '@pages/iou/request/step/BaseRequestStepWorkspace';
import DynamicIOURequestStepDestination from '@pages/iou/request/step/DynamicIOURequestStepDestination';
import IOURequestStepPerDiemWorkspace from '@pages/iou/request/step/IOURequestStepPerDiemWorkspace';

import {setCustomUnitID} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type {ComponentProps} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ActivityIndicator', () => 'ActivityIndicator');
jest.mock('@components/BlockingViews/FullPageOfflineBlockingView', () => 'OfflineView');
jest.mock('@components/Button', () => 'Button');
jest.mock('@components/DestinationPicker', () => 'DestinationPicker');
jest.mock('@components/FixedFooter', () => 'FixedFooter');
jest.mock('@components/ScreenWrapper', () => 'ScreenWrapper');
jest.mock('@components/WorkspaceEmptyStateSection', () => 'WorkspaceEmptyStateSection');
jest.mock('@pages/iou/request/step/StepScreenWrapper', () => 'StepScreenWrapper');
jest.mock('@pages/iou/request/step/withFullTransactionOrNotFound', () => (component: unknown) => component);
jest.mock('@pages/iou/request/step/withWritableReportOrNotFound', () => (component: unknown) => component);
jest.mock('@pages/iou/request/step/BaseRequestStepWorkspace', () => jest.fn(() => null));
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useDefaultExpensePolicy', () => () => undefined);
jest.mock('@hooks/usePersonalPolicy', () => () => undefined);
jest.mock('@hooks/useContentHeaderHeight', () => () => ({contentHeaderHeight: 0}));
jest.mock('@hooks/useDynamicBackPath', () => () => '');
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: () => ({})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useSafeAreaInsets', () => () => ({top: 0}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@libs/actions/Policy/PerDiem', () => ({fetchPerDiemRates: jest.fn()}));
jest.mock('@libs/actions/Transaction', () => ({setTransactionReport: jest.fn()}));
jest.mock('@libs/IOUUtils', () => ({getInitialPerDiemTargetReport: jest.fn()}));
jest.mock('@libs/ReportUtils', () => ({findSelfDMReportID: () => 'self-dm', getPolicyExpenseChat: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@userActions/IOU/MoneyRequest', () => ({
    getIOURequestPolicyID: (transaction: Transaction, report?: {policyID?: string}) => report?.policyID,
    setCustomUnitID: jest.fn(),
    setCustomUnitRateID: jest.fn(),
    setMoneyRequestCategory: jest.fn(),
    setMoneyRequestCurrency: jest.fn(),
    setMoneyRequestParticipants: jest.fn(),
    setMoneyRequestParticipantsFromReport: jest.fn(),
}));
jest.mock('@userActions/IOU/PerDiem', () => ({clearSubrates: jest.fn()}));

type DestinationProps = ComponentProps<typeof DynamicIOURequestStepDestination> & {transaction: Transaction; report?: Report};
type WorkspaceProps = ComponentProps<typeof IOURequestStepPerDiemWorkspace> & {transaction: Transaction};

const transaction = createMock<Transaction>({
    transactionID: '1',
    iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
    comment: {customUnit: {customUnitID: CONST.CUSTOM_UNITS.FAKE_P2P_ID, customUnitPolicyID: 'workspace-1'}},
});

function renderDestination(reportPolicyID?: string, explicitPolicyID?: string, draft = transaction) {
    return render(
        <DynamicIOURequestStepDestination
            {...createMock<DestinationProps>({
                route: {
                    name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION,
                    params: {transactionID: '1', action: CONST.IOU.ACTION.CREATE, iouType: CONST.IOU.TYPE.TRACK, reportID: 'self-dm'},
                },
                transaction: draft,
                report: reportPolicyID ? {reportID: 'self-dm', policyID: reportPolicyID} : undefined,
                explicitPolicyID,
            })}
        />,
    );
}

describe('Per diem workspace reconnect', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        await act(async () => Onyx.clear());
    });

    it.each([CONST.POLICY.ID_FAKE, undefined])('resolves the selected workspace when report policy is %s', async (reportPolicyID) => {
        // Given the workspace exists, but its per diem custom unit is not cached yet
        await act(async () => Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}workspace-1`, {id: 'workspace-1'}));

        // When Destination mounts for a self DM or a missing report
        renderDestination(reportPolicyID);
        await waitForBatchedUpdatesWithAct();

        // Then it fetches the selected workspace instead of showing Not here
        expect(fetchPerDiemRates).toHaveBeenCalledWith('workspace-1');
        expect(screen.getByTestId('DynamicIOURequestStepDestination').props.shouldShowNotFoundPage).toBe(false);
    });

    it.each([
        ['report-workspace', undefined, 'report-workspace'],
        [CONST.POLICY.ID_FAKE, 'explicit-workspace', 'explicit-workspace'],
    ])('preserves report and explicit policy precedence (%s, %s)', async (reportPolicyID, explicitPolicyID, expectedPolicyID) => {
        // Given another authoritative policy is provided by the report or inline destination
        await act(async () => Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${expectedPolicyID}`, {id: expectedPolicyID}));

        // When a draft also contains the last selected workspace
        renderDestination(reportPolicyID, explicitPolicyID);
        await waitForBatchedUpdatesWithAct();

        // Then the authoritative policy is fetched, without retargeting to the fallback
        expect(fetchPerDiemRates).toHaveBeenCalledWith(expectedPolicyID);
        expect(fetchPerDiemRates).not.toHaveBeenCalledWith('workspace-1');
    });

    it('fetches rates when the resolved policy arrives after mounting', async () => {
        // Given Destination mounts before the selected workspace data is available
        renderDestination(CONST.POLICY.ID_FAKE);
        await waitForBatchedUpdatesWithAct();
        expect(fetchPerDiemRates).not.toHaveBeenCalled();

        // When the workspace hydrates without any network status change
        await act(async () => Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}workspace-1`, {id: 'workspace-1'}));
        await waitForBatchedUpdatesWithAct();

        // Then the newly resolved workspace is fetched and no longer renders Not here
        expect(fetchPerDiemRates).toHaveBeenCalledWith('workspace-1');
        expect(screen.getByTestId('DynamicIOURequestStepDestination').props.shouldShowNotFoundPage).toBe(false);
    });

    it('still resolves older drafts through their loaded custom unit', async () => {
        // Given a draft saved before workspace IDs were persisted
        const legacyDraft = createMock<Transaction>({
            ...transaction,
            comment: {customUnit: {customUnitID: 'legacyUnit'}},
        });
        await act(async () =>
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}legacy-workspace`, {
                id: 'legacy-workspace',
                arePerDiemRatesEnabled: true,
                customUnits: {legacyUnit: {customUnitID: 'legacyUnit', name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL, rates: {}}},
            }),
        );

        // When Destination mounts without a real report policy
        renderDestination(CONST.POLICY.ID_FAKE, undefined, legacyDraft);
        await waitForBatchedUpdatesWithAct();

        // Then the existing custom-unit lookup remains available
        expect(fetchPerDiemRates).toHaveBeenCalledWith('legacy-workspace');
        expect(screen.getByTestId('DynamicIOURequestStepDestination').props.shouldShowNotFoundPage).toBe(false);
    });

    it('still shows Not here for a genuinely missing workspace after hydration', async () => {
        // Given the selected workspace is absent from Onyx
        renderDestination(CONST.POLICY.ID_FAKE);

        // When the policy subscriptions have finished loading
        await waitForBatchedUpdatesWithAct();

        // Then the missing workspace is not hidden behind an endless loader
        expect(screen.getByTestId('DynamicIOURequestStepDestination').props.shouldShowNotFoundPage).toBe(true);
    });

    it('retries the pending workspace on reconnect and preserves its identity before navigation', async () => {
        // Given offline global create targets a self DM and the selected workspace has no cached custom unit
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});
        jest.mocked(getInitialPerDiemTargetReport).mockReturnValue({
            targetReport: {reportID: 'self-dm', policyID: CONST.POLICY.ID_FAKE},
            targetIouType: CONST.IOU.TYPE.TRACK,
            transactionReportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        });
        render(
            <IOURequestStepPerDiemWorkspace
                {...createMock<WorkspaceProps>({
                    route: {params: {transactionID: '1', iouType: CONST.IOU.TYPE.CREATE}},
                    transaction,
                })}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        act(() =>
            jest
                .mocked(BaseRequestStepWorkspace)
                .mock.calls.at(-1)?.[0]
                ?.onSelectWorkspace?.(createMock<Policy>({id: 'workspace-1'})),
        );
        await waitForBatchedUpdatesWithAct();
        expect(setCustomUnitID).toHaveBeenCalledWith('1', CONST.CUSTOM_UNITS.FAKE_P2P_ID, 'workspace-1');
        expect(fetchPerDiemRates).toHaveBeenCalledTimes(1);

        // When useNetwork reports a reconnect for the pending selection
        act(() => jest.mocked(useNetwork).mock.calls.at(-1)?.[0]?.onReconnect?.());

        // Then the read is retried for that same workspace, without needing another selection
        expect(fetchPerDiemRates).toHaveBeenCalledTimes(2);
        expect(fetchPerDiemRates).toHaveBeenLastCalledWith('workspace-1');
    });
});
