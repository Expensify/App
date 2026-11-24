import {act, render, screen, waitFor} from '@testing-library/react-native';

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

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Rate} from '@src/types/onyx/Policy';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Forces the editable cells into the wide layout, which jsdom's default viewport doesn't naturally satisfy.
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({isLargeScreenWidth: true, shouldUseNarrowLayout: false, isInNarrowPaneModal: false}),
    useIsDisplayedInWideRHP: () => false,
}));

// EditableCell only enables the edit button while the cell is hovered, which jsdom can't simulate reliably.
jest.mock('@components/Hoverable', () => ({
    __esModule: true,
    default: ({children}: {children: ((isHovered: boolean) => React.ReactNode) | React.ReactNode}) => (typeof children === 'function' ? children(true) : children),
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

const SCREEN_WRAPPER_STATUS = {didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: true, isSafeAreaBottomPaddingApplied: true};

// styles.editableCellEditButtonClearance: the gap plus the edit button.
const EDIT_BUTTON_CLEARANCE = variables.spacing2 + variables.editableCellEditButtonSize;

const FORMATTED_RATE = '£0.45 / mile';
const GOVERNMENT_RATE = {sourceRateID: 'GB_2011-04-06', rate: 45, startDate: '2011-04-06'};

// Same amount and start date as the government rate it was created from, so its cell shows the bolt.
const AUTO_GENERATED_RATE: Rate = {
    customUnitRateID: 'auto',
    name: 'Government',
    rate: GOVERNMENT_RATE.rate,
    startDate: GOVERNMENT_RATE.startDate,
    currency: CONST.CURRENCY.GBP,
    enabled: true,
    attributes: {governmentRate: GOVERNMENT_RATE},
};

function buildItem(canEditRate: boolean): DistanceRateTableItemData {
    return {
        keyForList: AUTO_GENERATED_RATE.customUnitRateID,
        rateID: AUTO_GENERATED_RATE.customUnitRateID,
        rate: AUTO_GENERATED_RATE,
        formattedRate: FORMATTED_RATE,
        formattedTaxReclaimable: '',
        enabled: true,
        isLocked: false,
        action: jest.fn(),
        dismissError: jest.fn(),
        onToggleEnabled: jest.fn(),
        // The name isn't editable, so any edit button on screen belongs to the rate cell.
        canEditName: false,
        onRenameName: jest.fn(),
        canEditRate,
        onChangeRate: jest.fn(),
        canEditTaxReclaimable: false,
        onChangeTaxReclaimable: jest.fn(),
    };
}

type RenderOptions = {
    canWriteDistanceRates: boolean;
    canEditRate: boolean;
};

async function renderTable({canWriteDistanceRates, canEditRate}: RenderOptions) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <ScreenWrapperStatusContext.Provider value={SCREEN_WRAPPER_STATUS}>
                            <WorkspaceDistanceRatesTable
                                ratesData={[buildItem(canEditRate)]}
                                policyID="policy-1"
                                unit={CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}
                                selectionEnabled={false}
                                selectedKeys={[]}
                                canWriteDistanceRates={canWriteDistanceRates}
                                isDistanceRateTaxEnabled={false}
                                onRowSelectionChange={jest.fn()}
                            />
                        </ScreenWrapperStatusContext.Provider>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

/** The row that lays out the rate text and the bolt after it: the closest view around the rate text. */
function getRateTextRow() {
    let node = screen.getByText(FORMATTED_RATE).parent;
    while (node && typeof node.type !== 'string') {
        node = node.parent;
    }
    if (!node) {
        throw new Error('Expected the rate text to sit in a view');
    }

    // Without the bolt the text would sit straight in the cell, so a row here also shows the bolt is rendered.
    expect(node).toHaveStyle({flexDirection: 'row'});
    return node;
}

describe('WorkspaceDistanceRatesTable rate cell', () => {
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

    it('keeps the edit button clear of the bolt for a member who can edit the rate', async () => {
        // Given a member who can edit rates, viewing an auto-generated rate whose cell shows a bolt after the amount
        // When the table renders the row
        await renderTable({canWriteDistanceRates: true, canEditRate: true});

        // Then the cell shows its edit button, and the row keeps the button's width clear after the bolt, so the button
        // never covers the bolt and swallows the hover its tooltip needs
        await waitFor(() => {
            expect(screen.getByLabelText(TestHelper.translateLocal('common.edit'))).toBeOnTheScreen();
        });
        expect(getRateTextRow()).toHaveStyle({paddingRight: EDIT_BUTTON_CLEARANCE});
    });

    it('keeps the room for the edit button while the rate cannot be edited for now', async () => {
        // Given a member who can edit rates, whose rate cell isn't editable for now, as while rows are selected or the
        // rate is being deleted
        // When the table renders the row
        await renderTable({canWriteDistanceRates: true, canEditRate: false});

        // Then the room stays even though no edit button shows, so the bolt doesn't move sideways when selection mode
        // starts or ends
        expect(screen.queryByLabelText(TestHelper.translateLocal('common.edit'))).not.toBeOnTheScreen();
        expect(getRateTextRow()).toHaveStyle({paddingRight: EDIT_BUTTON_CLEARANCE});
    });

    it('leaves no room for the edit button when the member cannot edit rates', async () => {
        // Given a member who can't edit distance rates, who never gets the edit button
        // When the table renders the row
        await renderTable({canWriteDistanceRates: false, canEditRate: false});

        // Then nothing is kept clear after the bolt, matching the column width the table measures for this member
        expect(getRateTextRow()).not.toHaveStyle({paddingRight: EDIT_BUTTON_CLEARANCE});
    });
});
