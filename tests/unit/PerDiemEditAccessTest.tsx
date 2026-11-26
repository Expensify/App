import {render} from '@testing-library/react-native';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import EditPerDiemSubratePage from '@pages/workspace/perDiem/EditPerDiemSubratePage';
import WorkspacePerDiemDetailsPage from '@pages/workspace/perDiem/WorkspacePerDiemDetailsPage';

import CONST from '@src/CONST';
import type {CustomUnit} from '@src/types/onyx/Policy';

import type {ComponentProps} from 'react';

import React from 'react';

import createMock from '../utils/createMock';

let mockCustomUnit: CustomUnit;
jest.mock('@libs/PolicyUtils', () => ({getPerDiemCustomUnit: () => mockCustomUnit}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: jest.fn()}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencySymbol: () => '£', convertToDisplayStringWithoutCurrency: String})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@userActions/Policy/PerDiem', () => ({deleteWorkspacePerDiemRates: jest.fn(), editPerDiemRateSubrate: jest.fn()}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(() => null));
jest.mock('@components/Form/FormProvider', () => () => null);
jest.mock('@components/Form/InputWrapper', () => () => null);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ScreenWrapper', () => () => null);
jest.mock('@components/ScrollView', () => () => null);
jest.mock('@components/TextInput', () => () => null);
jest.mock('@components/MenuItem/presets/MenuItemAction', () => () => null);
jest.mock('@components/MenuItem/presets/MenuItemField', () => () => null);

const params = {policyID: 'policy', rateID: 'london', subRateID: 'breakfast'};
const getBlockedState = () => jest.mocked(AccessOrNotFoundWrapper).mock.calls.at(-1)?.[0].shouldBeBlocked;

describe('Per diem edit access during pending deletion', () => {
    beforeEach(() => {
        mockCustomUnit = {
            customUnitID: 'per-diem',
            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
            rates: {london: {customUnitRateID: 'london', name: 'London', subRates: [{id: 'breakfast', name: 'Breakfast', rate: 1000}]}},
        };
    });

    it('blocks details after deletion even when usePrevious retains the earlier row', () => {
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

        // Then the previous row is display-only and cannot keep edit access open
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
