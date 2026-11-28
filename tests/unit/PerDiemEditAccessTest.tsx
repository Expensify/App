import {act, render} from '@testing-library/react-native';

import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import EditPerDiemSubratePage from '@pages/workspace/perDiem/EditPerDiemSubratePage';
import WorkspacePerDiemDetailsPage from '@pages/workspace/perDiem/WorkspacePerDiemDetailsPage';

import {deleteWorkspacePerDiemRates} from '@userActions/Policy/PerDiem';

import CONST from '@src/CONST';
import type {CustomUnit} from '@src/types/onyx/Policy';

import type {ComponentProps, ReactNode} from 'react';
import type {GestureResponderEvent} from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

let mockCustomUnit: CustomUnit;
const mockShowConfirmModal = jest.fn();
jest.mock('@libs/PolicyUtils', () => ({getPerDiemCustomUnit: () => mockCustomUnit}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: mockShowConfirmModal}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencySymbol: () => '£', convertToDisplayStringWithoutCurrency: String})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn(), setNavigationActionToMicrotaskQueue: jest.fn()}));
jest.mock('@userActions/Policy/PerDiem', () => ({deleteWorkspacePerDiemRates: jest.fn(), editPerDiemRateSubrate: jest.fn()}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: {children: ReactNode}) => children));
jest.mock('@components/Form/FormProvider', () => () => null);
jest.mock('@components/Form/InputWrapper', () => () => null);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: {children: ReactNode}) =>
            children,
);
jest.mock('@components/TextInput', () => () => null);
jest.mock('@components/MenuItem/presets/MenuItemAction', () => jest.fn(() => null));
jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));

const params = {policyID: 'policy', rateID: 'london', subRateID: 'breakfast'};
const getBlockedState = () => jest.mocked(AccessOrNotFoundWrapper).mock.calls.at(-1)?.[0].shouldBeBlocked;

describe('Per diem edit access during pending deletion', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
        mockCustomUnit = {
            customUnitID: 'per-diem',
            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
            rates: {london: {customUnitRateID: 'london', name: 'London', currency: 'GBP', subRates: [{id: 'breakfast', name: 'Breakfast', rate: 1000}]}},
        };
    });

    it('blocks details when another client deletes the displayed rate', () => {
        // Given the details page was already open on an available subrate
        const props = createMock<ComponentProps<typeof WorkspacePerDiemDetailsPage>>({route: {params}});
        const {rerender} = render(<WorkspacePerDiemDetailsPage {...props} />);
        expect(getBlockedState()).toBe(false);

        // When that subrate becomes pending deletion in the same mounted page
        mockCustomUnit = {
            ...mockCustomUnit,
            rates: {london: {customUnitRateID: 'london', subRates: [{id: 'breakfast', name: 'Breakfast', rate: 1000, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]}},
        };
        rerender(<WorkspacePerDiemDetailsPage {...props} />);

        // Then a deletion not initiated by this page cannot keep edit access open
        expect(getBlockedState()).toBe(true);
    });

    it.each(['subrate', 'destination', 'last rate'] as const)('keeps confirmed %s deletion visible and disabled until navigation completes', async (deletion) => {
        // Given an available rate with navigation held so we can inspect the closing page
        const props = createMock<ComponentProps<typeof WorkspacePerDiemDetailsPage>>({route: {params}});
        const {rerender} = render(<WorkspacePerDiemDetailsPage {...props} />);

        // When deletion is confirmed and the optimistic update arrives before navigation
        await act(async () => {
            await jest.mocked(MenuItemAction).mock.calls.at(-1)?.[0].onPress(createMock<GestureResponderEvent>({}));
        });
        expect(deleteWorkspacePerDiemRates).toHaveBeenCalledWith(params.policyID, mockCustomUnit, [
            {destination: 'London', subRateName: 'Breakfast', rate: 1000, currency: 'GBP', rateID: params.rateID, subRateID: params.subRateID},
        ]);
        if (deletion === 'last rate') {
            mockCustomUnit = {...mockCustomUnit, rates: {}};
        } else {
            mockCustomUnit = {
                ...mockCustomUnit,
                rates: {
                    london: {
                        customUnitRateID: 'london',
                        pendingAction: deletion === 'destination' ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
                        subRates: [{id: 'breakfast', name: 'Breakfast', rate: 1000, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
                    },
                },
            };
        }
        rerender(<WorkspacePerDiemDetailsPage {...props} />);
        rerender(<WorkspacePerDiemDetailsPage {...props} />);

        // Then repeated renders retain all details without a not-found screen or editable controls
        expect(getBlockedState()).toBe(false);
        const fields = jest
            .mocked(MenuItemField)
            .mock.calls.slice(-4)
            .map(([field]) => field);
        expect(fields.map(({value}) => value)).toEqual(['London', 'Breakfast', '1000', 'GBP - £']);
        expect(fields.every(({isDisabled}) => isDisabled)).toBe(true);
        expect(jest.mocked(MenuItemAction).mock.calls.at(-1)?.[0].isDisabled).toBe(true);
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledTimes(1);
        jest.mocked(Navigation.setNavigationActionToMicrotaskQueue).mock.calls[0][0]();
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
    });

    it('does not enter the closing state when deletion is canceled', async () => {
        // Given an available rate and a canceled confirmation
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
        const props = createMock<ComponentProps<typeof WorkspacePerDiemDetailsPage>>({route: {params}});
        const {rerender} = render(<WorkspacePerDiemDetailsPage {...props} />);

        // When the dialog is canceled and another client subsequently removes the rate
        await act(async () => {
            await jest.mocked(MenuItemAction).mock.calls.at(-1)?.[0].onPress(createMock<GestureResponderEvent>({}));
        });
        expect(jest.mocked(MenuItemAction).mock.calls.at(-1)?.[0].isDisabled).toBe(false);
        mockCustomUnit = {...mockCustomUnit, rates: {}};
        rerender(<WorkspacePerDiemDetailsPage {...props} />);

        // Then cancellation neither deletes nor bypasses the missing-rate protection
        expect(deleteWorkspacePerDiemRates).not.toHaveBeenCalled();
        expect(Navigation.setNavigationActionToMicrotaskQueue).not.toHaveBeenCalled();
        expect(getBlockedState()).toBe(true);
    });

    it.each(['subrate', 'destination', 'missing'] as const)('blocks a direct details URL for a deleted %s', (deletion) => {
        // Given a rate that was deleted before the details page opened
        mockCustomUnit.rates = {
            london: {
                customUnitRateID: 'london',
                pendingAction: deletion === 'destination' ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
                subRates: deletion === 'missing' ? [] : [{id: 'breakfast', name: 'Breakfast', rate: 1000, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
            },
        };

        // When the deleted rate is opened directly rather than deleted from this page
        render(<WorkspacePerDiemDetailsPage {...createMock<ComponentProps<typeof WorkspacePerDiemDetailsPage>>({route: {params}})} />);

        // Then no local confirmation exists to bypass the not-found screen
        expect(getBlockedState()).toBe(true);
    });

    it.each([false, true])('blocks a direct edit URL for a pending deletion (whole destination: %s)', (isWholeDestination) => {
        // Given either Breakfast or its entire parent destination is pending deletion
        mockCustomUnit.rates = {
            london: {
                customUnitRateID: 'london',
                pendingAction: isWholeDestination ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined,
                subRates: [
                    {id: 'breakfast', name: 'Breakfast', rate: 1000, pendingAction: isWholeDestination ? undefined : CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                    {id: 'lunch', name: 'Lunch', rate: 2000},
                ],
            },
        };
        const props = createMock<ComponentProps<typeof EditPerDiemSubratePage>>({route: {params}});

        // When a user directly opens the edit URL rather than pressing a table row
        const {rerender} = render(<EditPerDiemSubratePage {...props} />);

        // Then the deletion is blocked; an unaffected sibling is only editable if its parent is available
        expect(getBlockedState()).toBe(true);
        rerender(<EditPerDiemSubratePage {...createMock<ComponentProps<typeof EditPerDiemSubratePage>>({route: {params: {...params, subRateID: 'lunch'}}})} />);
        expect(getBlockedState()).toBe(isWholeDestination);
    });
});
