import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import WorkspaceDistanceRatesTable from '@components/Tables/WorkspaceDistanceRatesTable';
import type {DistanceRateTableItemData} from '@components/Tables/WorkspaceDistanceRatesTable/WorkspaceDistanceRatesTableRow';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {renameDistanceRateInline} from '@libs/actions/Policy/InlineEdit';

import {updatePolicyDistanceRateName} from '@userActions/Policy/DistanceRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/Policy/DistanceRate', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test-only module mock. jest.requireActual returns an untyped module
    const actual = jest.requireActual('@userActions/Policy/DistanceRate');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- test-only module mock. Spreads the real actions and replaces only updatePolicyDistanceRateName
    return {
        ...actual,
        updatePolicyDistanceRateName: jest.fn(),
    };
});

// Forces the editable cells into the wide layout, which jsdom's default viewport doesn't naturally satisfy.
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({isLargeScreenWidth: true, shouldUseNarrowLayout: false, isInNarrowPaneModal: false}),
}));

// EditableCell only enables the edit-pencil button while the cell is hovered, which jsdom can't simulate reliably.
jest.mock('@components/Hoverable', () => ({
    __esModule: true,
    default: ({children}: {children: ((isHovered: boolean) => React.ReactNode) | React.ReactNode}) => (typeof children === 'function' ? children(true) : children),
}));

const mockUpdatePolicyDistanceRateName = jest.mocked(updatePolicyDistanceRateName);

const WIDE_LAYOUT: ResponsiveLayoutResult = {
    shouldUseNarrowLayout: false,
    isSmallScreenWidth: false,
    isInNarrowPaneModal: false,
    isExtraSmallScreenHeight: false,
    isMediumScreenWidth: false,
    isLargeScreenWidth: true,
    isExtraLargeScreenWidth: false,
    isExtraSmallScreenWidth: false,
    isSmallScreen: false,
    onboardingIsMediumOrLargerScreenWidth: true,
    isInLandscapeMode: false,
};

const SCREEN_WRAPPER_STATUS = {didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: true, isSafeAreaBottomPaddingApplied: true};

const POLICY_ID = 'policy-1';
const GOVERNMENT_ATTRIBUTES = {governmentRate: {sourceRateID: 'GB_2026-09-01', rate: 14, startDate: '2026-09-01'}};

const BASE_RATE = {rate: 1400, currency: CONST.CURRENCY.USD, enabled: true, startDate: '2026-09-01', attributes: GOVERNMENT_ATTRIBUTES};
const CARS_RATE: Rate = {...BASE_RATE, customUnitRateID: 'cars', name: 'Cars - From 9/1/26'};
const BIKES_RATE: Rate = {...BASE_RATE, customUnitRateID: 'bikes', name: 'Bikes - From 9/1/26'};

const CUSTOM_UNIT: CustomUnit = {
    customUnitID: 'unit-1',
    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
    attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
    enabled: true,
    rates: {cars: CARS_RATE, bikes: BIKES_RATE},
};

/** Mirrors how PolicyDistanceRatesPage wires the inline name cell to renameDistanceRateInline. */
function buildRow(rate: Rate): DistanceRateTableItemData {
    return {
        keyForList: rate.customUnitRateID,
        rateID: rate.customUnitRateID,
        rate,
        formattedRate: '$14.00 / mile',
        enabled: true,
        isLocked: false,
        canEditName: true,
        canEditRate: false,
        action: jest.fn(),
        dismissError: jest.fn(),
        onToggleEnabled: jest.fn(),
        onRenameName: (newName: string) => {
            renameDistanceRateInline(TestHelper.translateLocal, POLICY_ID, CUSTOM_UNIT, rate, newName);
        },
        onChangeRate: jest.fn(),
    };
}

function renderTable() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <ScreenWrapperStatusContext.Provider value={SCREEN_WRAPPER_STATUS}>
                            <WorkspaceDistanceRatesTable
                                ratesData={[buildRow(CARS_RATE)]}
                                policyID={POLICY_ID}
                                unit={CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}
                                selectionEnabled={false}
                                selectedKeys={[]}
                                canWriteDistanceRates
                                onRowSelectionChange={jest.fn()}
                            />
                        </ScreenWrapperStatusContext.Provider>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
}

/** Starts editing the name cell, which is the first editable cell in the row, and returns its input. */
async function startEditingName() {
    await waitFor(() => {
        expect(screen.getAllByLabelText(TestHelper.translateLocal('common.edit')).length).toBeGreaterThan(0);
    });
    const editButton = screen.getAllByLabelText(TestHelper.translateLocal('common.edit')).at(0);
    if (!editButton) {
        throw new Error('Expected the name edit button');
    }
    fireEvent.press(editButton);
    await waitForBatchedUpdatesWithAct();

    const input = screen.getAllByLabelText(TestHelper.translateLocal('common.name')).find((element) => typeof element.props.value === 'string');
    if (!input) {
        throw new Error('Expected the name input');
    }
    return input;
}

describe('WorkspaceDistanceRatesTable inline rename', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(WIDE_LAYOUT);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('prefills the name without the date suffix and saves the new name with the suffix appended', async () => {
        // Given a government band whose name carries a date suffix the backend added for uniqueness
        renderTable();
        await waitForBatchedUpdatesWithAct();

        // When the user starts editing its name
        const input = await startEditingName();

        // Then the edit field starts from the name without the suffix, matching the name shown in the table
        expect(input.props.value).toBe('Cars');

        // When the user renames it to "Vans" and blurs
        fireEvent.changeText(input, 'Vans');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then the original suffix is appended back, so Onyx and the API still get the full raw name
        expect(mockUpdatePolicyDistanceRateName).toHaveBeenCalledWith(POLICY_ID, CUSTOM_UNIT, [expect.objectContaining({customUnitRateID: 'cars', name: 'Vans - From 9/1/26'})]);
    });

    it('does not rename when the user blurs without typing', async () => {
        // Given a government band whose name carries a date suffix
        renderTable();
        await waitForBatchedUpdatesWithAct();

        // When the user starts editing its name and blurs without typing
        const input = await startEditingName();
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then nothing is saved, because the full name would be unchanged
        expect(mockUpdatePolicyDistanceRateName).not.toHaveBeenCalled();
    });

    it('does not save a name that duplicates another rate once the suffix is appended', async () => {
        // Given a government band and another band whose full name is "Bikes - From 9/1/26"
        renderTable();
        await waitForBatchedUpdatesWithAct();

        // When the user types "Bikes", which only collides once the hidden suffix is added back
        const input = await startEditingName();
        fireEvent.changeText(input, 'Bikes');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then the duplicate check runs against the full name that would be saved, so the rename is dropped
        expect(mockUpdatePolicyDistanceRateName).not.toHaveBeenCalled();
    });
});
