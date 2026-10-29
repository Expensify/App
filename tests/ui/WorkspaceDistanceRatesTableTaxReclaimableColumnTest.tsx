import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ActiveSorting, CompareItemsCallback, TableColumn} from '@components/Table';
import type {DistanceRateTableItemData} from '@components/Tables/WorkspaceDistanceRatesTable/WorkspaceDistanceRatesTableRow';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import PolicyDistanceRatesPage from '@pages/workspace/distanceRates/PolicyDistanceRatesPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {Rate} from '@src/types/onyx/Policy';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

let capturedColumns: Array<TableColumn<string>> = [];
let capturedData: DistanceRateTableItemData[] = [];
let capturedCompareItems: CompareItemsCallback<DistanceRateTableItemData, string> | undefined;

type CapturedTableProps = {
    columns: Array<TableColumn<string>>;
    data: DistanceRateTableItemData[];
    compareItems?: CompareItemsCallback<DistanceRateTableItemData, string>;
};

// Renders the real Table, but also captures the props it receives. jsdom doesn't re-render the FlashList rows after a
// header press, so the sorting test checks the comparator the header press would apply instead of the rendered order.
jest.mock('@components/Table', () => {
    const actual = jest.requireActual<{default: React.ComponentType<CapturedTableProps>}>('@components/Table');
    const RealTable = actual.default;

    // Kept outside CapturingTable, which the React Compiler treats as a component: capturing render props into a module
    // variable is only for this test's assertions and would otherwise look like an impure component body.
    function captureTableProps({columns, data, compareItems}: CapturedTableProps) {
        capturedColumns = columns;
        capturedData = data;
        capturedCompareItems = compareItems;
    }

    function CapturingTable(props: CapturedTableProps) {
        captureTableProps(props);
        return <RealTable {...props} />;
    }

    // Copies Table.Header, Table.Body, etc. onto the wrapper and keeps the real helpers.
    return {
        ...actual,
        __esModule: true,
        default: Object.assign(CapturingTable, RealTable),
    };
});

// Forces the table cells into the wide layout, which jsdom's default viewport doesn't naturally satisfy.
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({isLargeScreenWidth: true, shouldUseNarrowLayout: false, isInNarrowPaneModal: false}),
    useIsDisplayedInWideRHP: () => false,
}));

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

const Stack = createPlatformStackNavigator<WorkspaceSplitNavigatorParamList>();

const POLICY_ID = 'policy-1';
const CUSTOM_UNIT_ID = 'unit-1';
const TAX_RATE_ID = 'id_VAT';

/** Matches a standalone amount like "$2.00", so the formatted rate cell ("$10.00 / mile") is never matched. */
const AMOUNT_TEXT = /^\$\d+\.\d{2}$/;

function buildRate(customUnitRateID: string, overrides?: Partial<Rate>): Rate {
    return {customUnitRateID, name: customUnitRateID, rate: 1000, currency: CONST.CURRENCY.USD, enabled: true, ...overrides};
}

function buildPolicy(rates: Rate[], trackingEnabled: boolean, taxEnabled: boolean): Policy {
    return {
        ...LHNTestUtils.getFakePolicy(POLICY_ID),
        role: CONST.POLICY.ROLE.ADMIN,
        outputCurrency: CONST.CURRENCY.USD,
        areDistanceRatesEnabled: true,
        tax: {trackingEnabled},
        taxRates: {name: 'Tax', defaultExternalID: TAX_RATE_ID, defaultValue: '20%', foreignTaxDefault: TAX_RATE_ID, taxes: {[TAX_RATE_ID]: {name: 'VAT', value: '20%'}}},
        customUnits: {
            [CUSTOM_UNIT_ID]: {
                customUnitID: CUSTOM_UNIT_ID,
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, taxEnabled},
                enabled: true,
                rates: Object.fromEntries(rates.map((rate) => [rate.customUnitRateID, rate])),
            },
        },
    };
}

/** Renders the real distance rates page, so the tests cover how it builds the rows and decides the column visibility. */
async function renderPage(rates: Rate[], {trackingEnabled = true, taxEnabled = true}: {trackingEnabled?: boolean; taxEnabled?: boolean} = {}) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy(rates, trackingEnabled, taxEnabled));
    });

    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DISTANCE_RATES}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.DISTANCE_RATES}
                                component={PolicyDistanceRatesPage}
                                initialParams={{policyID: POLICY_ID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

function getColumnHeaderLabel() {
    return TestHelper.translateLocal('workspace.taxes.taxReclaimableOn');
}

/** Returns the tax reclaimable cell texts in the order the rows are rendered. */
function getRenderedAmounts() {
    return screen.queryAllByText(AMOUNT_TEXT).map((element) => String(element.props.children));
}

describe('PolicyDistanceRatesPage tax reclaimable column', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await TestHelper.signInWithTestUser();
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

    it('shows the header when policy tax tracking and distance tax are both on', async () => {
        // Given a workspace that tracks tax on its distance rates, with a rate that has no tax set up yet
        await renderPage([buildRate('cars')]);

        // Then the column header is shown regardless of the rates, so admins can see where the amount will appear
        expect(screen.getByLabelText(getColumnHeaderLabel())).toBeTruthy();
    });

    it.each([
        ['policy tax tracking is off', {trackingEnabled: false, taxEnabled: true}],
        ['distance tax is off', {trackingEnabled: true, taxEnabled: false}],
    ])('hides the header when %s', async (_, settings) => {
        // Given a rate that would have a tax reclaimable amount, but only one of the two tax settings is on
        await renderPage([buildRate('cars', {attributes: {taxClaimablePercentage: 0.5, taxRateExternalID: TAX_RATE_ID}})], settings);

        // Then neither the header nor the amount is shown, matching the rate details page that hides the field in this case
        expect(screen.queryByLabelText(getColumnHeaderLabel())).toBeNull();
        expect(getRenderedAmounts()).toEqual([]);
    });

    it('shows the computed amount for a rate with a percentage and a valid tax rate', async () => {
        // Given a $10.00 rate where 50% is tax reclaimable under a tax rate that exists on the workspace
        await renderPage([buildRate('cars', {attributes: {taxClaimablePercentage: 0.5, taxRateExternalID: TAX_RATE_ID}})]);

        // Then the cell shows percentage × rate in the rate currency, like the rate details page
        expect(screen.getByText('$5.00')).toBeTruthy();

        // And the row label reads the amount out, so screen reader users get the same information
        expect(screen.getByLabelText(new RegExp(`${getColumnHeaderLabel()}: \\$5\\.00`))).toBeTruthy();
    });

    it('leaves the cell blank when the percentage is missing or zero', async () => {
        // Given two rates with a valid tax rate, one without a percentage and one with a zero percentage
        await renderPage([
            buildRate('missing', {attributes: {taxRateExternalID: TAX_RATE_ID}}),
            buildRate('zero', {attributes: {taxClaimablePercentage: 0, taxRateExternalID: TAX_RATE_ID}}),
        ]);

        // Then the column is shown but neither row shows an amount, since there is nothing to reclaim
        expect(screen.getByLabelText(getColumnHeaderLabel())).toBeTruthy();
        expect(getRenderedAmounts()).toEqual([]);

        // And the row labels don't mention the tax reclaimable amount
        expect(screen.queryByLabelText(new RegExp(`${getColumnHeaderLabel()}:`))).toBeNull();
    });

    it('leaves the cell blank when the tax rate is missing or does not exist on the workspace', async () => {
        // Given two rates with a percentage, one without a tax rate and one whose tax rate was removed from the workspace
        await renderPage([
            buildRate('missing', {attributes: {taxClaimablePercentage: 0.5}}),
            buildRate('removed', {attributes: {taxClaimablePercentage: 0.5, taxRateExternalID: 'id_REMOVED'}}),
        ]);

        // Then neither row shows an amount, matching the rate details page that hides the field without a valid tax rate
        expect(screen.getByLabelText(getColumnHeaderLabel())).toBeTruthy();
        expect(getRenderedAmounts()).toEqual([]);
    });

    it('orders the rows by amount when sorting by the column', async () => {
        // Given three rates whose name order differs from their tax reclaimable amount order
        await renderPage([
            buildRate('Alpha', {attributes: {taxClaimablePercentage: 0.8, taxRateExternalID: TAX_RATE_ID}}),
            buildRate('Bravo', {attributes: {taxClaimablePercentage: 0.2, taxRateExternalID: TAX_RATE_ID}}),
            buildRate('Charlie', {attributes: {taxClaimablePercentage: 0.5, taxRateExternalID: TAX_RATE_ID}}),
        ]);

        // Then the column is sortable
        expect(capturedColumns.find((column) => column.key === 'taxReclaimableOn')?.sortable).toBe(true);

        // When the rows are sorted by the column, the way the table sorts them after a header press
        const sortRates = (order: ActiveSorting['order']) =>
            [...capturedData].sort((a, b) => capturedCompareItems?.(a, b, {columnKey: 'taxReclaimableOn', order}) ?? 0).map((row) => row.formattedTaxReclaimable);

        // Then ascending order puts the lowest amount first, and descending order puts the highest first
        expect(sortRates(CONST.SEARCH.SORT_ORDER.ASC)).toEqual(['$2.00', '$5.00', '$8.00']);
        expect(sortRates(CONST.SEARCH.SORT_ORDER.DESC)).toEqual(['$8.00', '$5.00', '$2.00']);
    });
});
