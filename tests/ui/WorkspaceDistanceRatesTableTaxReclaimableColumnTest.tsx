import {act, fireEvent, render, renderHook, screen, waitFor, within} from '@testing-library/react-native';

import Button from '@components/Button';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ActiveSorting, CompareItemsCallback, TableColumn} from '@components/Table';
import type {DistanceRateTableItemData} from '@components/Tables/WorkspaceDistanceRatesTable/WorkspaceDistanceRatesTableRow';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import * as usePolicyFeatureWriteAccessModule from '@hooks/usePolicyFeatureWriteAccess';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import useTheme from '@hooks/useTheme';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {buildOnyxDataForPolicyDistanceRateUpdates} from '@libs/PolicyDistanceRatesUtils';
import showInlineEditError from '@libs/showInlineEditError';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import PolicyDistanceRatesPage from '@pages/workspace/distanceRates/PolicyDistanceRatesPage';

import {updateDistanceTaxClaimableValue} from '@userActions/Policy/DistanceRate';
import type * as DistanceRateActions from '@userActions/Policy/DistanceRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

jest.mock('@userActions/Policy/DistanceRate', () => ({
    ...jest.requireActual<typeof DistanceRateActions>('@userActions/Policy/DistanceRate'),
    updateDistanceTaxClaimableValue: jest.fn(),
}));
jest.mock('@libs/showInlineEditError', () => ({__esModule: true, default: jest.fn()}));

// The pencil is enabled only on hover, which jsdom cannot simulate reliably.
jest.mock('@components/Hoverable', () => ({
    __esModule: true,
    default: ({children}: {children: ((isHovered: boolean) => React.ReactNode) | React.ReactNode}) => (typeof children === 'function' ? children(true) : children),
}));

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

// The heading opens the column menu, which is named after the column.
function getColumnHeadingLabel() {
    return TestHelper.translateLocal('search.columnMenu.openMenu', {columnName: getColumnHeaderLabel()});
}

/** Returns the tax reclaimable cell texts in the order the rows are rendered. */
function getRenderedAmounts() {
    return screen.queryAllByText(AMOUNT_TEXT).map((element) => String(element.props.children));
}

async function startEditingTax() {
    const editButton = screen.getAllByLabelText(TestHelper.translateLocal('common.edit')).at(-1);
    if (!editButton) {
        throw new Error('Expected the tax edit button');
    }
    fireEvent.press(editButton);
    await waitForBatchedUpdatesWithAct();

    const input = screen.getAllByLabelText(getColumnHeaderLabel()).find((element) => typeof element.props.value === 'string');
    if (!input) {
        throw new Error('Expected the tax amount input');
    }
    return input;
}

describe('PolicyDistanceRatesPage', () => {
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
        jest.restoreAllMocks();
    });

    describe.each([false, true])('Settings header with narrow layout: %s', (shouldUseNarrowLayout) => {
        it.each([false, true])('opens Settings directly with fuel warning: %s', async (hasFuelWarning) => {
            // Given a normal rate or an enabled fuel band without a VAT mapping
            jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({...WIDE_LAYOUT, shouldUseNarrowLayout});
            const navigate = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
            const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Gear', 'DotIndicator']));
            const {result: theme} = renderHook(() => useTheme());
            await renderPage([buildRate('cars', {attributes: hasFuelWarning ? {governmentRate: {sourceRateID: 'GB_PETROL_UP_TO_1400_2026-09-01'}} : {}})]);

            // When the header renders, the warning changes only the icon, not the action or label
            const settings = screen.getByRole('button', {name: TestHelper.translateLocal('common.settings')});
            const icon = settings.find((node) => node.type === Button.Icon);

            // Then there is no More menu or dropdown arrow, and the warning dot stays red on hover
            expect(icon.props.src).toEqual(hasFuelWarning ? icons.current.DotIndicator : icons.current.Gear);
            expect(icon.props.fill).toBe(hasFuelWarning ? theme.current.danger : undefined);
            expect(icon.props.hoverFill).toBe(hasFuelWarning ? theme.current.danger : undefined);
            expect(screen.queryByText(TestHelper.translateLocal('common.more'))).toBeNull();
            expect(within(settings).queryByTestId('dropdown-arrow-icon')).toBeNull();

            // When Settings is pressed once, it navigates directly once
            fireEvent.press(settings);
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(POLICY_ID));
        });
    });

    it.each(['dismissal', 'mapping'])('restores the Settings gear after %s clears the warning', async (resolution) => {
        // Given a header showing a fuel VAT warning
        const {result: icons} = renderHook(() => useMemoizedLazyExpensifyIcons(['Gear', 'DotIndicator']));
        await renderPage([buildRate('cars', {attributes: {governmentRate: {sourceRateID: 'GB_PETROL_UP_TO_1400_2026-09-01'}}})]);
        const settings = () => screen.getByRole('button', {name: TestHelper.translateLocal('common.settings')});
        expect(settings().find((node) => node.type === Button.Icon).props.src).toEqual(icons.current.DotIndicator);

        // When the workspace receives either a dismissal or a valid tax mapping
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                customUnits: {
                    [CUSTOM_UNIT_ID]: resolution === 'dismissal' ? {attributes: {isUKFuelRateTaxErrorDismissed: true}} : {rates: {cars: {attributes: {taxRateExternalID: TAX_RATE_ID}}}},
                },
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Then the direct Settings button shows its gear again, with no warning dot
        await waitFor(() => {
            expect(settings().find((node) => node.type === Button.Icon).props.src).toEqual(icons.current.Gear);
        });
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.settings')})).toBeOnTheScreen();
    });

    it('shows the header when both tax settings are on and a rate has an amount', async () => {
        // Given a workspace that tracks tax on its distance rates, with a rate that has a tax reclaimable amount
        await renderPage([buildRate('cars', {attributes: {taxClaimablePercentage: 0.5, taxRateExternalID: TAX_RATE_ID}})]);

        // Then the column header is shown
        expect(screen.getByLabelText(getColumnHeadingLabel())).toBeTruthy();
    });

    it('hides the header when no rate has an amount', async () => {
        // Given a workspace that tracks tax on its distance rates, but whose rates have no percentage set
        await renderPage([buildRate('cars', {attributes: {taxRateExternalID: TAX_RATE_ID}}), buildRate('bikes')]);

        // Then the column is hidden, like the date columns when no rate has a date, so the table has no empty column
        expect(screen.queryByLabelText(getColumnHeadingLabel())).toBeNull();
        expect(getRenderedAmounts()).toEqual([]);
    });

    it.each([
        ['policy tax tracking is off', {trackingEnabled: false, taxEnabled: true}],
        ['distance tax is off', {trackingEnabled: true, taxEnabled: false}],
    ])('hides the header when %s', async (_, settings) => {
        // Given a rate that would have a tax reclaimable amount, but only one of the two tax settings is on
        await renderPage([buildRate('cars', {attributes: {taxClaimablePercentage: 0.5, taxRateExternalID: TAX_RATE_ID}})], settings);

        // Then neither the header nor the amount is shown, matching the rate details page that hides the field in this case
        expect(screen.queryByLabelText(getColumnHeadingLabel())).toBeNull();
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
        // Given two rates with a valid tax rate, one without a percentage and one with a zero percentage, next to a rate with an amount
        await renderPage([
            buildRate('missing', {attributes: {taxRateExternalID: TAX_RATE_ID}}),
            buildRate('zero', {attributes: {taxClaimablePercentage: 0, taxRateExternalID: TAX_RATE_ID}}),
            buildRate('set', {attributes: {taxClaimablePercentage: 0.5, taxRateExternalID: TAX_RATE_ID}}),
        ]);

        // Then the column is shown, but only the rate with a percentage shows an amount, since the others have nothing to reclaim
        expect(screen.getByLabelText(getColumnHeadingLabel())).toBeTruthy();
        expect(getRenderedAmounts()).toEqual(['$5.00']);

        // And only that row's label mentions the tax reclaimable amount
        expect(screen.getAllByLabelText(new RegExp(`${getColumnHeaderLabel()}:`))).toHaveLength(1);
    });

    it('shows the amount when the tax rate is missing or does not exist on the workspace', async () => {
        // Given two rates with a percentage, one without a tax rate and one whose tax rate was removed from the workspace
        await renderPage([
            buildRate('missing', {attributes: {taxClaimablePercentage: 0.5}}),
            buildRate('removed', {attributes: {taxClaimablePercentage: 0.2, taxRateExternalID: 'id_REMOVED'}}),
        ]);

        // Then both rows show their amount, because expenses still apply the percentage when the rate has no valid tax rate
        expect(screen.getByLabelText(getColumnHeadingLabel())).toBeTruthy();
        expect(getRenderedAmounts().sort()).toEqual(['$2.00', '$5.00']);
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

    it('prefills a raw amount and saves the converted percentage on blur', async () => {
        // Given a rate with a reclaimable amount that needs all four decimal places
        const rate = buildRate('cars', {attributes: {taxClaimablePercentage: 0.12345, taxRateExternalID: TAX_RATE_ID}});
        await renderPage([rate]);

        // When the tax cell is opened, it must not use the formatted currency string as its edit buffer
        const input = await startEditingTax();
        expect(input.props.value).toBe('1.2345');
        fireEvent.changeText(input, '2.3456');
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then the page delegates to the canonical action with the converted fraction and existing attributes
        expect(updateDistanceTaxClaimableValue).toHaveBeenCalledWith(POLICY_ID, expect.objectContaining({customUnitID: CUSTOM_UNIT_ID}), [
            {...rate, attributes: {...rate.attributes, taxClaimablePercentage: (2.3456 * 100) / 1000}},
        ]);
    });

    it.each(['10', '11'])('shows the inline error and rejects an invalid amount of %s', async (newAmount) => {
        // Given a ten-dollar rate with an editable reclaimable amount
        await renderPage([buildRate('cars', {attributes: {taxClaimablePercentage: 0.5, taxRateExternalID: TAX_RATE_ID}})]);

        // When the amount is not strictly below the rate
        const input = await startEditingTax();
        fireEvent.changeText(input, newAmount);
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then the page shows the shared validation error without writing the change
        expect(showInlineEditError).toHaveBeenCalledWith(TestHelper.translateLocal('workspace.taxes.error.updateTaxClaimableFailureMessage'));
        expect(updateDistanceTaxClaimableValue).not.toHaveBeenCalled();
    });

    it('does not save when the tax editor blurs unchanged', async () => {
        // Given an editable tax amount
        await renderPage([buildRate('cars', {attributes: {taxClaimablePercentage: 0.5}})]);

        // When the editor is opened and closed without typing
        const input = await startEditingTax();
        fireEvent(input, 'blur');
        await waitForBatchedUpdatesWithAct();

        // Then no action is called for the unchanged amount
        expect(updateDistanceTaxClaimableValue).not.toHaveBeenCalled();
    });

    it('only permits tax editing for a valid tax rate or an existing percentage', async () => {
        // Given blank cells with no tax, a removed tax, a valid tax, and a percentage without a tax
        await renderPage([
            buildRate('none'),
            buildRate('removed', {attributes: {taxRateExternalID: 'id_REMOVED'}}),
            buildRate('valid', {attributes: {taxRateExternalID: TAX_RATE_ID}}),
            buildRate('percentage', {attributes: {taxClaimablePercentage: 0.2}}),
            buildRate('deleting', {attributes: {taxClaimablePercentage: 0.2}, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
        ]);

        // When the page builds the inline edit permissions
        const permissions = Object.fromEntries(capturedData.map((row) => [row.rateID, row.canEditTaxReclaimable]));

        // Then the details page tax eligibility is enforced in addition to the existing deletion restriction
        expect(permissions).toEqual({none: false, removed: false, valid: true, percentage: true, deleting: false});
    });

    it('disables tax editing while rows are selected', async () => {
        // Given an eligible tax amount in a table that allows row selection
        await renderPage([buildRate('cars', {attributes: {taxClaimablePercentage: 0.5}})]);
        expect(capturedData.at(0)?.canEditTaxReclaimable).toBe(true);

        // When the user enters selection mode
        fireEvent.press(screen.getAllByLabelText(TestHelper.translateLocal('common.select'))[0]);
        await waitForBatchedUpdatesWithAct();

        // Then editing is unavailable so selecting a row cannot also change its tax amount
        expect(capturedData.at(0)?.canEditTaxReclaimable).toBe(false);
    });

    it('disables tax editing when distance rates are read-only', async () => {
        // Given an eligible amount but no write access to distance rates
        const accessSpy = jest.spyOn(usePolicyFeatureWriteAccessModule, 'default').mockReturnValue({
            canWrite: false,
            showReadOnlyModal: jest.fn(),
            withReadOnlyFallback: jest.fn(),
        });

        // When the page builds the tax cell permissions
        await renderPage([buildRate('cars', {attributes: {taxClaimablePercentage: 0.5}})]);

        // Then tax eligibility cannot bypass the workspace write restriction
        expect(capturedData.at(0)?.canEditTaxReclaimable).toBe(false);
        accessSpy.mockRestore();
    });

    it.each(['name', 'rate', 'taxClaimablePercentage'] as const)('shows a failed %s save and dismisses its error without removing the rate', async (field) => {
        // Given an existing rate and canonical update data, all inline fields must report failures consistently
        const rate = buildRate('cars', {attributes: {taxClaimablePercentage: 0.5, taxRateExternalID: TAX_RATE_ID}});
        const customUnit = buildPolicy([rate], true, true).customUnits?.[CUSTOM_UNIT_ID];
        if (!customUnit) {
            throw new Error('Expected the distance custom unit');
        }
        await renderPage([rate]);
        const updatedRate = {...rate, name: 'Updated name', rate: 2000, attributes: {...rate.attributes, taxClaimablePercentage: 0.2}};
        const {optimisticData, failureData} = buildOnyxDataForPolicyDistanceRateUpdates(POLICY_ID, customUnit, [updatedRate], field);

        // When the backend rejects the update, the canonical failure data restores the amount and attaches a field error
        await act(async () => {
            await Onyx.update(optimisticData ?? []);
            await Onyx.update(failureData ?? []);
        });
        await waitForBatchedUpdatesWithAct();

        // Then the original values return and the server failure is visible instead of silently reverting
        expect(screen.getByText(TestHelper.translateLocal('common.genericErrorMessage'))).toBeTruthy();
        expect(capturedData.at(0)?.rateID).toBe('cars');
        expect(screen.getByText('$5.00')).toBeTruthy();
        expect(capturedData.at(0)?.rate).toMatchObject({name: rate.name, rate: rate.rate, attributes: rate.attributes});
        expect(capturedData.at(0)?.pendingAction).toBeUndefined();
        expect(capturedData.at(0)?.rate.errorFields?.[field]).toBeDefined();

        // When the user dismisses the failed edit, it must not take the failed-create removal path
        await act(async () => capturedData.at(0)?.dismissError());
        await waitForBatchedUpdatesWithAct();

        // Then only the error is cleared and the restored rate remains in both Onyx and the table
        expect(screen.queryByText(TestHelper.translateLocal('common.genericErrorMessage'))).toBeNull();
        expect(capturedData.at(0)?.rateID).toBe('cars');
        expect(capturedData.at(0)?.rate.errorFields?.[field]).toBeFalsy();
        expect(capturedData.at(0)?.rate).toMatchObject({name: rate.name, rate: rate.rate, attributes: rate.attributes});
    });

    it('dismisses simultaneous field errors without changing either rate', async () => {
        // Given multiple failed edits and already-cleared fields, every displayed field error must be dismissible
        const rate = buildRate('cars', {
            attributes: {taxClaimablePercentage: 0.5, taxRateExternalID: TAX_RATE_ID},
            errorFields: {name: {nameError: 'Name save failed'}, rate: {rateError: 'Rate save failed'}, taxClaimablePercentage: {taxError: 'Tax save failed'}, enabled: null, currency: {}},
        });
        const otherRate = buildRate('bikes');
        await renderPage([rate, otherRate]);
        expect(capturedData.find((row) => row.rateID === 'cars')?.errors).toEqual({nameError: 'Name save failed', rateError: 'Rate save failed', taxError: 'Tax save failed'});

        // When the user dismisses the row feedback once
        await act(async () => capturedData.find((row) => row.rateID === 'cars')?.dismissError());
        await waitForBatchedUpdatesWithAct();

        // Then all aggregated errors clear without deleting a rate or changing its saved attributes
        expect(capturedData.find((row) => row.rateID === 'cars')?.errors).toEqual({});
        expect(capturedData.find((row) => row.rateID === 'cars')?.rate).toMatchObject({
            name: rate.name,
            rate: rate.rate,
            currency: rate.currency,
            enabled: rate.enabled,
            attributes: rate.attributes,
        });
        expect(capturedData.find((row) => row.rateID === 'bikes')?.rate).toEqual(otherRate);
        expect(screen.queryByText('Tax save failed')).toBeNull();
    });

    it('keeps row errors ahead of field errors and dismisses both without removing the rate', async () => {
        // Given a restored row-level failure alongside a failed inline edit, existing row-error handling takes precedence
        await renderPage([buildRate('cars', {errors: {deleteError: 'Delete failed'}, errorFields: {name: {nameError: 'Name save failed'}}})]);
        expect(capturedData.at(0)?.errors).toEqual({deleteError: 'Delete failed'});

        // When the row-level error is dismissed, the field error must remain available
        await act(async () => capturedData.at(0)?.dismissError());
        await waitForBatchedUpdatesWithAct();
        expect(capturedData.at(0)?.rateID).toBe('cars');
        expect(capturedData.at(0)?.errors).toEqual({nameError: 'Name save failed'});

        // When the remaining field error is dismissed
        await act(async () => capturedData.at(0)?.dismissError());
        await waitForBatchedUpdatesWithAct();

        // Then both errors are gone and the restored row was never removed
        expect(capturedData.at(0)?.rateID).toBe('cars');
        expect(capturedData.at(0)?.errors).toEqual({});
        expect(screen.queryByText('Delete failed')).toBeNull();
        expect(screen.queryByText('Name save failed')).toBeNull();
    });
});
