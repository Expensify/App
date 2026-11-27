import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import FlatNavSubnav from '@components/Navigation/FlatNavigationBar/FlatNavSubnav';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type {ActiveFlatNavItem, FlatNavCannedSearchItem, FlatNavItem, FlatNavSavedSearchItem, FlatNavSubnavGroup} from '@libs/Navigation/FlatNav/types';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const {SEARCH_KEYS} = CONST.SEARCH;

let mockIsOffline = false;
const mockHandleShare = jest.fn();
const mockShowDeleteModal = jest.fn();

jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));
jest.mock('@hooks/useDeleteSavedSearch', () => () => ({
    showDeleteModal: mockShowDeleteModal,
}));
jest.mock('@hooks/useShareSavedSearch', () => () => ({
    copiedID: null,
    handleShare: mockHandleShare,
}));
// The marker's slide is Reanimated's work. What the subnav owns is the position it hands the marker.
const mockSubnavMarker = jest.fn<null, [{top: number | undefined}]>(() => null);
jest.mock('@components/Navigation/FlatNavigationBar/FlatNavSubnavMarker', () => (props: {top: number | undefined}) => mockSubnavMarker(props));
jest.mock('@pages/Search/SavedSearchItemThreeDotMenu', () => {
    // The factory is hoisted above the imports, so it loads what it renders itself.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {Text: MockText} = require('react-native');
    return ({menuItems}: {menuItems: PopoverMenuItem[]}) => menuItems.map((menuItem) => <MockText key={menuItem.text}>{`menu:${menuItem.text}`}</MockText>);
});

function createCannedItem(key: FlatNavCannedSearchItem['key'], sectionID: FlatNavCannedSearchItem['sectionID'], overrides: Partial<FlatNavCannedSearchItem> = {}): FlatNavCannedSearchItem {
    return {
        type: FLAT_NAV.ITEM_TYPE.CANNED_SEARCH,
        key,
        sectionID,
        translationPath: 'search.tabs.expenses',
        spendColumnTranslationPath: 'search.tabs.expenses',
        iconName: 'Receipt',
        searchQuery: `type:expense ${key}`,
        ...overrides,
    };
}

function createSavedItem(savedSearchID: string, overrides: Partial<FlatNavSavedSearchItem> = {}): FlatNavSavedSearchItem {
    return {
        type: FLAT_NAV.ITEM_TYPE.SAVED_SEARCH,
        key: savedSearchIDToSearchKey(savedSearchID),
        sectionID: FLAT_NAV.SECTION.SAVED,
        savedSearchID,
        name: `Saved ${savedSearchID}`,
        title: `Saved ${savedSearchID}`,
        query: 'type:expense',
        iconName: 'Bookmark',
        isDisabled: false,
        ...overrides,
    };
}

const REPORTS_ITEM = createCannedItem(SEARCH_KEYS.REPORTS, FLAT_NAV.SECTION.REPORTS, {translationPath: 'search.tabs.reports'});
const APPROVE_ITEM = createCannedItem(SEARCH_KEYS.APPROVE, FLAT_NAV.SECTION.REPORTS, {translationPath: 'common.approve', badgeText: '2'});
const EXPENSES_ITEM = createCannedItem(SEARCH_KEYS.EXPENSES, FLAT_NAV.SECTION.EXPENSES);

const EXPENSE_REPORTS_GROUP: FlatNavSubnavGroup = {
    id: FLAT_NAV.SUBNAV_GROUP.EXPENSE_REPORTS,
    translationPath: 'search.tabs.expenseReports',
    items: [EXPENSES_ITEM, REPORTS_ITEM, APPROVE_ITEM],
};

const ACTIVE_REPORTS: ActiveFlatNavItem = {
    sectionID: FLAT_NAV.SECTION.REPORTS,
    itemKey: SEARCH_KEYS.REPORTS,
};
const ACTIVE_APPROVE: ActiveFlatNavItem = {
    sectionID: FLAT_NAV.SECTION.REPORTS,
    itemKey: SEARCH_KEYS.APPROVE,
};

function createSavedGroup(items: FlatNavSavedSearchItem[]): FlatNavSubnavGroup {
    return {
        id: FLAT_NAV.SUBNAV_GROUP.SAVED,
        translationPath: 'search.savedSearchesMenuItemTitle',
        items,
    };
}

type RenderSubnavParams = {
    groups?: FlatNavSubnavGroup[];
    activeItem?: ActiveFlatNavItem;
    isVisible?: boolean;
    onItemPress?: (item: FlatNavItem) => void;
};

function SubnavUnderTest({groups = [EXPENSE_REPORTS_GROUP], activeItem, isVisible = true, onItemPress = jest.fn()}: RenderSubnavParams) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <FlatNavSubnav
                groups={groups}
                activeItem={activeItem}
                isVisible={isVisible}
                onItemPress={onItemPress}
            />
        </ComposeProviders>
    );
}

function getRow(name: string) {
    return screen.getByRole(CONST.ROLE.TAB, {name});
}

describe('FlatNavSubnav', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await waitForBatchedUpdatesWithAct();
    });

    it('should list every search under a static header', async () => {
        // Given a group with its searches
        // When the subnav renders
        render(<SubnavUnderTest />);
        await waitForBatchedUpdatesWithAct();

        // Then the header and every search are there, and the header is a label rather than something to press
        expect(
            screen.getByRole(CONST.ROLE.HEADER, {
                name: translateLocal('search.tabs.expenseReports'),
            }),
        ).toBeOnTheScreen();
        expect(screen.queryByRole(CONST.ROLE.BUTTON)).toBeNull();
        expect(getRow(translateLocal('search.tabs.expenses'))).toBeOnTheScreen();
        expect(getRow(translateLocal('search.tabs.reports'))).toBeOnTheScreen();
        expect(getRow(translateLocal('common.approve'))).toBeOnTheScreen();
    });

    it('should show the count of a search on its row', async () => {
        // Given a search with a count
        // When the subnav renders
        render(<SubnavUnderTest />);
        await waitForBatchedUpdatesWithAct();

        // Then the count is on the row, because nothing hides the rows
        expect(screen.getByText('2')).toBeOnTheScreen();
    });

    it('should select the row of the active item and follow it as the active item changes', async () => {
        // Given the subnav rendered with the reports search active
        const {rerender} = render(<SubnavUnderTest activeItem={ACTIVE_REPORTS} />);
        await waitForBatchedUpdatesWithAct();
        expect(getRow(translateLocal('search.tabs.reports')).props.accessibilityState).toMatchObject({selected: true});
        expect(getRow(translateLocal('common.approve')).props.accessibilityState).toMatchObject({selected: false});

        // When the active search changes to approve
        rerender(<SubnavUnderTest activeItem={ACTIVE_APPROVE} />);

        // Then the selection moves with it, since the bar has no state of its own for it
        expect(getRow(translateLocal('search.tabs.reports')).props.accessibilityState).toMatchObject({selected: false});
        expect(getRow(translateLocal('common.approve')).props.accessibilityState).toMatchObject({selected: true});
    });

    it('should select no row when no group holds the current search', async () => {
        // Given a current search that belongs to none of the groups, such as an ad hoc query
        // When the subnav renders without an active item
        render(<SubnavUnderTest activeItem={undefined} />);
        await waitForBatchedUpdatesWithAct();

        // Then no row is selected
        expect(getRow(translateLocal('search.tabs.reports')).props.accessibilityState).toMatchObject({selected: false});
        expect(getRow(translateLocal('common.approve')).props.accessibilityState).toMatchObject({selected: false});
    });

    it('should point the marker at the active row', async () => {
        // Given Reports is active, the second row under the first header
        // When the subnav renders
        render(<SubnavUnderTest activeItem={ACTIVE_REPORTS} />);
        await waitForBatchedUpdatesWithAct();

        // Then the marker sits below the header and the Expenses row, centred on the Reports row
        const {flatNavigationBarSubnavHeaderHeight: headerHeight, flatNavigationBarSubnavItemHeight: itemHeight, flatNavigationBarSubnavMarkerHeight: markerHeight} = variables;
        expect(mockSubnavMarker).toHaveBeenLastCalledWith({top: headerHeight + itemHeight + (itemHeight - markerHeight) / 2});
    });

    it('should give the marker no position when no row is active', async () => {
        // Given a current search that belongs to none of the groups
        // When the subnav renders without an active item
        render(<SubnavUnderTest activeItem={undefined} />);
        await waitForBatchedUpdatesWithAct();

        // Then the marker has nowhere to point, which fades it out
        expect(mockSubnavMarker).toHaveBeenLastCalledWith({top: undefined});
    });

    it('should hand the pressed canned search to the caller', async () => {
        // Given a subnav with a handler
        const onItemPress = jest.fn();
        render(<SubnavUnderTest onItemPress={onItemPress} />);
        await waitForBatchedUpdatesWithAct();

        // When the user presses a row
        fireEvent.press(getRow(translateLocal('common.approve')));

        // Then the caller gets the item, so it can navigate on the last query the user left that search with
        expect(onItemPress).toHaveBeenCalledTimes(1);
        expect(onItemPress).toHaveBeenCalledWith(APPROVE_ITEM);
    });

    it('should render a saved search with a menu to rename, share and delete it', async () => {
        // Given a group with a saved search
        const savedItem = createSavedItem('1');

        // When the subnav renders
        render(<SubnavUnderTest groups={[createSavedGroup([savedItem])]} />);
        await waitForBatchedUpdatesWithAct();

        // Then the row shows its title and its menu offers every action
        expect(getRow(savedItem.title)).toBeOnTheScreen();
        expect(screen.getByText(`menu:${translateLocal('common.rename')}`)).toBeOnTheScreen();
        expect(screen.getByText(`menu:${translateLocal('common.share')}`)).toBeOnTheScreen();
        expect(screen.getByText(`menu:${translateLocal('common.delete')}`)).toBeOnTheScreen();
    });

    it('should hand the pressed saved search to the caller', async () => {
        // Given a subnav rendered with a saved search and a handler
        const savedItem = createSavedItem('1');
        const onItemPress = jest.fn();
        render(
            <SubnavUnderTest
                groups={[createSavedGroup([savedItem])]}
                onItemPress={onItemPress}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // When the user presses the saved search row
        fireEvent.press(getRow(savedItem.title));

        // Then the caller gets the saved search item so it can open the corresponding search query
        expect(onItemPress).toHaveBeenCalledWith(savedItem);
    });

    it('should constrain the pressable wrapper so a long label truncates within the row under the three-dot menu', async () => {
        // Given a saved search with a title too long for its row
        const savedItem = createSavedItem('1', {title: 'Very long saved search title that needs to be truncated within its row'});

        // When the subnav renders
        render(<SubnavUnderTest groups={[createSavedGroup([savedItem])]} />);
        await waitForBatchedUpdatesWithAct();

        // Then the pressable wrapper is constrained to flex1 so the long title truncates within the row, and the three-dot menu drawn over the row's end is still rendered
        const row = getRow(savedItem.title);
        expect(StyleSheet.flatten(row.parent?.props.style)).toMatchObject({flex: 1});
        expect(screen.getByText(`menu:${translateLocal('common.rename')}`)).toBeOnTheScreen();
    });

    it('should show a saved search that is pending delete as disabled while offline', async () => {
        // Given an offline user, whose deletion cannot reach the server yet
        mockIsOffline = true;
        const savedItem = createSavedItem('1', {isDisabled: true, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
        const onItemPress = jest.fn();
        render(
            <SubnavUnderTest
                groups={[createSavedGroup([savedItem])]}
                onItemPress={onItemPress}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // When the user presses the row
        fireEvent.press(getRow(savedItem.title));

        // Then it is still listed, but nothing opens, because the search is about to disappear
        expect(getRow(savedItem.title).props.accessibilityState).toMatchObject({
            disabled: true,
        });
        expect(onItemPress).not.toHaveBeenCalled();
    });

    it('should grey out a saved search added or renamed while offline', async () => {
        // Given an offline user who saved or renamed a search, so the change has not reached the server yet
        mockIsOffline = true;
        const savedItem = createSavedItem('1', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

        // When the subnav renders
        render(<SubnavUnderTest groups={[createSavedGroup([savedItem])]} />);
        await waitForBatchedUpdatesWithAct();

        // Then the row gets the pending add feedback, as in the Spend column, while it can still be opened
        expect(screen.UNSAFE_getByType(OfflineWithFeedback).props.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        expect(getRow(savedItem.title).props.accessibilityState).toMatchObject({disabled: false});
    });

    it('should hide its rows from assistive technology while it is closed', async () => {
        // Given a subnav that is not visible, as when the bar is a rail
        // When the subnav renders
        render(<SubnavUnderTest isVisible={false} />);
        await waitForBatchedUpdatesWithAct();

        // Then its content is out of the accessibility tree and cannot be pressed. aria-hidden is what hides it on web, where the bar lives.
        const subnav = screen.getByTestId('FlatNavSubnav', {includeHiddenElements: true});
        expect(subnav.props['aria-hidden']).toBe(true);
        expect(subnav.props.accessibilityElementsHidden).toBe(true);
        expect(subnav.props.pointerEvents).toBe('none');
    });
});
