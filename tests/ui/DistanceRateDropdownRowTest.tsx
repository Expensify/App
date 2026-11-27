/** Rate fields retain the live bordered-row behavior without a legacy push-row branch. */
import {fireEvent, render, screen} from '@testing-library/react-native';

import DropdownFieldRow from '@components/DropdownFieldRow';
import RateField from '@components/MoneyRequestConfirmationList/sections/RateField';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import type {MileageRate} from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';

import React from 'react';

import createMock from '../utils/createMock';

let mockIsReadOnly = false;
const mockCreateAction = CONST.IOU.ACTION.CREATE;
const mockSubmitType = CONST.IOU.TYPE.SUBMIT;
jest.mock('@components/MoneyRequestConfirmationFields/context', () => ({
    useConfirmationFields: () => ({action: mockCreateAction, iouType: mockSubmitType, transactionID: '1', reportID: '2', isReadOnly: mockIsReadOnly, isPolicyExpenseChat: true}),
}));
jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => ({renderProductTrainingTooltip: () => null, shouldShowProductTrainingTooltip: true, hideProductTrainingTooltip: jest.fn()}),
}));
jest.mock('@components/Search/SearchRouter/SearchRouterContext', () => ({useSearchRouterState: () => ({isSearchRouterDisplayed: false})}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencySymbol: () => '$', convertToDisplayString: () => '$0.50'})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, toLocaleDigit: (value: string) => value}));
jest.mock('@libs/DistanceRequestUtils', () => ({
    __esModule: true,
    default: {isCustomUnitRateOutOfDateRange: () => false, getRateForExpenseDisplay: () => '$0.50 / mi'},
}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock(
    '@components/Tooltip/EducationalTooltip',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);

function renderRate(formError = '') {
    return render(
        <RateField
            distanceRateName="Mileage"
            distanceRateCurrency="USD"
            unit="mi"
            mileageRate={createMock<MileageRate>({rate: 50})}
            expenseDate="2026-11-24"
            customUnitRateID={undefined}
            policy={undefined}
            formError={formError}
            shouldNavigateToUpgradePath={false}
            shouldSelectPolicy={false}
            shouldShowRateAutoUpdatedTooltip
        />,
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    mockIsReadOnly = false;
});

it('uses the bordered rate row and preserves navigation without a dropdown-layout provider', () => {
    // Given the rate field no longer has an alternate push-row presentation.
    renderRate();

    // When its visible value is pressed.
    fireEvent.press(screen.getByText('$0.50 / mi'), {nativeEvent: {}});

    // Then the bordered row opens the existing rate editor and keeps its update tooltip.
    expect(screen.UNSAFE_getByType(DropdownFieldRow)).toBeDefined();
    expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    expect(screen.UNSAFE_getByType(EducationalTooltip).props.shouldRender).toBe(true);
});

it('retains read-only restrictions and suppresses the update tooltip for a rate error', () => {
    // Given a rate with a validation error on a read-only confirmation.
    mockIsReadOnly = true;
    renderRate('iou.error.invalidRate');

    // When the user presses its value.
    fireEvent.press(screen.getByText('$0.50 / mi'), {nativeEvent: {}});

    // Then the error remains visible but editing and the competing tooltip stay unavailable.
    expect(screen.getByText('iou.error.invalidRate')).toBeOnTheScreen();
    expect(Navigation.navigate).not.toHaveBeenCalled();
    expect(screen.UNSAFE_getByType(EducationalTooltip).props.shouldRender).toBe(false);
});
