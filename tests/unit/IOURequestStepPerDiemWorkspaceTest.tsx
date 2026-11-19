import {act, render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';

import useNetwork from '@hooks/useNetwork';

import {fetchPerDiemRates} from '@libs/actions/Policy/PerDiem';
import {getInitialPerDiemTargetReport} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type * as PolicyUtils from '@libs/PolicyUtils/customUnits';

import BaseRequestStepWorkspace from '@pages/iou/request/step/BaseRequestStepWorkspace';
import IOURequestStepPerDiemWorkspace from '@pages/iou/request/step/IOURequestStepPerDiemWorkspace';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type {ComponentType, ComponentProps} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@pages/iou/request/step/withFullTransactionOrNotFound', () => (Component: ComponentType) => Component);
jest.mock('@pages/iou/request/step/BaseRequestStepWorkspace', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useDefaultExpensePolicy', () => () => undefined);
jest.mock('@hooks/usePersonalPolicy', () => () => undefined);
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@components/BlockingViews/FullPageOfflineBlockingView', () => jest.fn(() => null));
jest.mock('@libs/actions/Policy/PerDiem', () => ({fetchPerDiemRates: jest.fn()}));
jest.mock('@libs/IOUUtils', () => ({getInitialPerDiemTargetReport: jest.fn()}));
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ReportUtils'),
    findSelfDMReportID: () => 'selfDM',
    getPolicyExpenseChat: jest.fn(),
}));
jest.mock('@libs/PolicyUtils', () => ({
    getPerDiemCustomUnit: jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils/customUnits').getPerDiemCustomUnit,
    getActivePoliciesWithExpenseChatAndPerDiemEnabled: jest.fn(),
}));
jest.mock('@libs/AppState', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@userActions/Transaction', () => ({setTransactionReport: jest.fn()}));
jest.mock('@userActions/IOU/MoneyRequest', () => ({
    setCustomUnitID: jest.fn(),
    setMoneyRequestCategory: jest.fn(),
    setMoneyRequestParticipants: jest.fn(),
    setMoneyRequestParticipantsFromReport: jest.fn(),
}));

const POLICY_ID = '1';
const REPORT_ID = '123';
const TRANSACTION_ID = '456';
const ANIMATION_FRAME_DURATION = 16;
const perDiemUnit = {customUnitID: 'perDiemUnit', name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL};
const policyWithRates = createMock<Policy>({id: POLICY_ID, customUnits: {[perDiemUnit.customUnitID]: {...perDiemUnit, rates: {}}}});

const page = (
    <IOURequestStepPerDiemWorkspace
        {...createMock<ComponentProps<typeof IOURequestStepPerDiemWorkspace>>({
            route: {
                key: 'per-diem-workspace',
                name: SCREENS.MONEY_REQUEST.CREATE,
                params: {iouType: CONST.IOU.TYPE.SUBMIT, transactionID: TRANSACTION_ID, reportID: REPORT_ID},
            },
        })}
    />
);

function selectWorkspace(policy: Policy) {
    const props = jest.mocked(BaseRequestStepWorkspace).mock.lastCall?.[0];
    if (!props) {
        throw new Error('Workspace selection was not rendered');
    }
    act(() => props.onSelectWorkspace(policy));
}

describe('IOURequestStepPerDiemWorkspace', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(useNetwork).mockReturnValue(createMock<ReturnType<typeof useNetwork>>({isOffline: false}));
        await Onyx.clear();
        jest.mocked(getInitialPerDiemTargetReport).mockReturnValue({
            targetReport: {reportID: REPORT_ID, policyID: POLICY_ID},
            targetIouType: CONST.IOU.TYPE.SUBMIT,
            transactionReportID: REPORT_ID,
        });
    });

    it.each([
        ['custom unit', createMock<Policy>({id: POLICY_ID})],
        ['rates', createMock<Policy>({id: POLICY_ID, customUnits: {[perDiemUnit.customUnitID]: perDiemUnit}})],
    ])('keeps the in-tab loader visible until the missing %s arrives', async (_missingData, policy) => {
        // Given a workspace chat with a real policy ID but uncached per diem data
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        render(page);
        await waitForBatchedUpdatesWithAct();

        // When the workspace is selected before its rates finish loading
        selectWorkspace(policy);
        await waitForBatchedUpdatesWithAct();

        // Then navigation waits and the existing tab content shows its loading indicator
        expect(fetchPerDiemRates).toHaveBeenCalledWith(POLICY_ID);
        expect(fetchPerDiemRates).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
        expect(screen.UNSAFE_queryByType(BaseRequestStepWorkspace)).toBeNull();

        // When only the custom unit arrives, it is still too early to open Destination
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, customUnits: {[perDiemUnit.customUnitID]: perDiemUnit}});
        });
        await waitForBatchedUpdatesWithAct();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

        // When rates arrive, the pending selection can continue without another tap
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policyWithRates);
        });
        await waitForBatchedUpdatesWithAct();
        act(() => jest.advanceTimersByTime(ANIMATION_FRAME_DURATION));

        // Then Destination opens once and the in-tab loader is cleared
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESTINATION.path));
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it.each([
        ['custom unit', createMock<Policy>({id: POLICY_ID})],
        ['rates', createMock<Policy>({id: POLICY_ID, customUnits: {[perDiemUnit.customUnitID]: perDiemUnit}})],
    ])('retries fetching the missing %s on reconnect before continuing the pending selection', async (_missingData, policy) => {
        // Given an offline workspace whose per diem data has not been cached
        jest.mocked(useNetwork).mockReturnValue(createMock<ReturnType<typeof useNetwork>>({isOffline: true}));
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        const {rerender} = render(page);
        await waitForBatchedUpdatesWithAct();

        // When selection attempts a read while offline
        selectWorkspace(policy);
        await waitForBatchedUpdatesWithAct();

        // Then it remains pending behind the offline view instead of navigating
        expect(fetchPerDiemRates).toHaveBeenCalledTimes(1);
        expect(fetchPerDiemRates).toHaveBeenCalledWith(POLICY_ID);
        expect(screen.UNSAFE_getByType(FullPageOfflineBlockingView)).toBeTruthy();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When connectivity returns, the discarded read needs to be retried
        jest.mocked(useNetwork).mockReturnValue(createMock<ReturnType<typeof useNetwork>>({isOffline: false}));
        rerender(React.cloneElement(page));
        await waitForBatchedUpdatesWithAct();

        // Then a new request starts but Destination still waits for its rates
        expect(fetchPerDiemRates).toHaveBeenCalledTimes(2);
        expect(fetchPerDiemRates).toHaveBeenLastCalledWith(POLICY_ID);
        expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the pending policy updates without rates, it must not start another read
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {name: 'Updated workspace'});
        });
        await waitForBatchedUpdatesWithAct();
        expect(fetchPerDiemRates).toHaveBeenCalledTimes(2);

        // When the retried read supplies rates, selection can finish without another tap
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policyWithRates);
        });
        await waitForBatchedUpdatesWithAct();
        act(() => jest.advanceTimersByTime(ANIMATION_FRAME_DURATION));

        // Then Destination opens once and the in-tab loader clears
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESTINATION.path));
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it('opens Destination immediately when rates are already cached', async () => {
        // Given a workspace whose rates have already loaded
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policyWithRates);
        render(page);
        await waitForBatchedUpdatesWithAct();

        // When the workspace is selected
        selectWorkspace(policyWithRates);

        // Then no fetch or loading state is needed
        expect(fetchPerDiemRates).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });
});
