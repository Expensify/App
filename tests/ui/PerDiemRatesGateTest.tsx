import {act, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useNetwork from '@hooks/useNetwork';

import {fetchPerDiemRates} from '@libs/actions/Policy/PerDiem';

import PerDiemRatesGate from '@pages/iou/request/step/PerDiemRatesGate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {Rate} from '@src/types/onyx/Policy';

import React from 'react';
import {Text} from 'react-native';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@libs/actions/Policy/PerDiem', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Policy/PerDiem'),
    fetchPerDiemRates: jest.fn(),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({EmptyStateExpenses: () => null}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

const POLICY_ID = 'policy-1';
const OTHER_POLICY_ID = 'policy-2';
const CUSTOM_UNIT_ID = 'per-diem-unit';
const CONTENT = 'per diem content';

const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockFetchPerDiemRates = fetchPerDiemRates as jest.MockedFunction<typeof fetchPerDiemRates>;

function createPolicy(id: string, rates?: Record<string, Rate>): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Per diem policy'),
        id,
        role: CONST.POLICY.ROLE.USER,
        customUnits: {
            [CUSTOM_UNIT_ID]: {
                customUnitID: CUSTOM_UNIT_ID,
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                enabled: true,
                // Missing rates mean they haven't been fetched yet, while an empty object means the workspace has none, so
                // the unit is stored without them even though the type always expects them.
                rates: rates as Record<string, Rate>,
            },
        },
    };
}

function renderGate(policyID: string) {
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <PerDiemRatesGate policyID={policyID}>
                    <Text>{CONTENT}</Text>
                </PerDiemRatesGate>
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
}

describe('PerDiemRatesGate', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseNetwork.mockReturnValue({isOffline: false});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('shows the content once the workspace has rates, without fetching them again', async () => {
        // Given a workspace whose per diem rates are already in Onyx
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createPolicy(POLICY_ID, {rate1: {customUnitRateID: 'rate1', name: 'Paris', rate: 100, currency: 'EUR'}}));
        });

        // When the gate renders
        renderGate(POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        // Then the content shows right away and no request goes out for rates the app already has
        expect(screen.getByText(CONTENT)).toBeTruthy();
        expect(mockFetchPerDiemRates).not.toHaveBeenCalled();
    });

    it('shows a loader and fetches the rates when they are missing', async () => {
        // Given a workspace whose per diem rates haven't been loaded
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createPolicy(POLICY_ID));
        });

        // When the gate renders while online
        renderGate(POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        // Then it holds the content back and asks for the rates, since the form can't work without them
        expect(screen.queryByText(CONTENT)).toBeNull();
        expect(mockFetchPerDiemRates).toHaveBeenCalledWith(POLICY_ID);
    });

    it('fetches the rates of a new workspace when the policy changes while mounted', async () => {
        // Given the gate is mounted on a workspace whose rates are loading
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createPolicy(POLICY_ID));
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`, createPolicy(OTHER_POLICY_ID));
        });
        const {rerender} = renderGate(POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        // When the draft moves to another workspace, e.g. from the report field, and the gate stays mounted
        rerender(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <PerDiemRatesGate policyID={OTHER_POLICY_ID}>
                        <Text>{CONTENT}</Text>
                    </PerDiemRatesGate>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the new workspace's rates are fetched too, so the form isn't stuck on the loader
        expect(mockFetchPerDiemRates).toHaveBeenCalledWith(OTHER_POLICY_ID);
    });

    it('shows the offline view instead of fetching when the rates are missing offline', async () => {
        // Given the user is offline and the workspace's rates haven't been loaded
        mockUseNetwork.mockReturnValue({isOffline: true});
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createPolicy(POLICY_ID));
        });

        // When the gate renders
        renderGate(POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        // Then no request is made and the content stays hidden, since there is nothing to show it with
        expect(mockFetchPerDiemRates).not.toHaveBeenCalled();
        expect(screen.queryByText(CONTENT)).toBeNull();
    });

    it('shows the empty state when the workspace has no rates', async () => {
        // Given a workspace whose rates were loaded and turned out to be empty
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createPolicy(POLICY_ID, {}));
        });

        // When the gate renders
        renderGate(POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        // Then the user is told there are no rates instead of seeing a form they can't fill in
        expect(screen.queryByText(CONTENT)).toBeNull();
        expect(screen.getByText(translateLocal('workspace.perDiem.requestEmptyList.title'))).toBeTruthy();
    });
});
