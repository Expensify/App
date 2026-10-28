import {act, renderHook} from '@testing-library/react-native';

import type {MobileSelectionMenuModalWrapperProps} from '@components/Modal/Global/MobileSelectionMenuModalWrapper';
import {ModalActions, ModalProvider} from '@components/Modal/Global/ModalContext';
import useRowLongPressMenu from '@components/Search/primitives/useRowLongPressMenu';
import type {SearchListItem, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';

import CONST from '@src/CONST';

import React from 'react';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

let mockMenuProps: MobileSelectionMenuModalWrapperProps | undefined;

// The real menu is covered by MobileSelectionMenuModalWrapperTest. Here it only records the props the global stack
// passes it, so the test can answer the menu the way the user would.
jest.mock('@components/Modal/Global/MobileSelectionMenuModalWrapper', () => ({
    __esModule: true,
    default: (props: MobileSelectionMenuModalWrapperProps) => {
        mockMenuProps = props;
        return null;
    },
}));

const mockToggle = jest.fn();
jest.mock('@components/Search/SearchContext', () => ({
    useSearchRowSelectionActions: () => ({toggle: mockToggle}),
}));

jest.mock('@libs/actions/MobileSelectionMode', () => ({
    turnOnMobileSelectionMode: jest.fn(),
}));

const mockRoute = {key: 'search-route'};
jest.mock('@react-navigation/native', () => ({
    useRoute: () => mockRoute,
}));

const mockGetCurrentRoute = jest.fn<{key: string} | undefined, []>();
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {current: {getCurrentRoute: () => mockGetCurrentRoute()}},
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixtures are intentionally partial rows
const ITEM = {keyForList: 'row1'} as unknown as SearchListItem;
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixtures are intentionally partial rows
const ITEM_TRANSACTIONS = [{keyForList: 'transaction1'}] as unknown as TransactionListItemType[];

type HookParams = Parameters<typeof useRowLongPressMenu>[0];

function renderLongPressMenu(params: Partial<HookParams> = {}) {
    return renderHook(() => useRowLongPressMenu({isSmallScreenWidth: true, isMobileSelectionModeEnabled: false, ...params}), {
        wrapper: ({children}: {children: React.ReactNode}) => <ModalProvider>{children}</ModalProvider>,
    });
}

async function longPress(onLongPressRow: (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => void, item: SearchListItem = ITEM) {
    await act(async () => {
        onLongPressRow(item, ITEM_TRANSACTIONS);
        await waitForBatchedUpdates();
    });
}

async function answerMenu(action: typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE) {
    await act(async () => {
        mockMenuProps?.closeModal({action});
        await waitForBatchedUpdates();
    });
}

describe('useRowLongPressMenu', () => {
    beforeEach(() => {
        mockMenuProps = undefined;
        mockToggle.mockClear();
        jest.mocked(turnOnMobileSelectionMode).mockClear();
        mockGetCurrentRoute.mockReturnValue(mockRoute);
    });

    it('turns on selection mode and selects the pressed row once the user picks "Select"', async () => {
        // Given a narrow Search list that is not in selection mode yet
        const {result} = renderLongPressMenu();

        // When the user long presses a row
        await longPress(result.current.onLongPressRow);

        // Then the global "Select" menu opens with the Search Sentry label, and nothing is selected yet
        expect(mockMenuProps?.sentryLabel).toBe(CONST.SENTRY_LABEL.SEARCH.SELECTION_MODE_MENU_ITEM);
        expect(turnOnMobileSelectionMode).not.toHaveBeenCalled();
        expect(mockToggle).not.toHaveBeenCalled();

        // When the user picks "Select"
        await answerMenu(ModalActions.CONFIRM);

        // Then selection mode turns on and the row that was long pressed is the one selected, with its transactions
        expect(turnOnMobileSelectionMode).toHaveBeenCalledTimes(1);
        expect(mockToggle).toHaveBeenCalledTimes(1);
        expect(mockToggle).toHaveBeenCalledWith(ITEM, ITEM_TRANSACTIONS);
    });

    it('selects the row once when the menu resolves on "Select" and then leaves the stack after hiding', async () => {
        // Given a narrow Search list with the menu open after a long press
        const {result} = renderLongPressMenu();
        await longPress(result.current.onLongPressRow);

        // When the menu resolves CONFIRM as soon as "Select" is pressed
        await act(async () => {
            mockMenuProps?.resolveModal({action: ModalActions.CONFIRM});
            await waitForBatchedUpdates();
        });

        // Then selection mode turns on right away, while the menu is still hiding
        expect(turnOnMobileSelectionMode).toHaveBeenCalledTimes(1);
        expect(mockToggle).toHaveBeenCalledWith(ITEM, ITEM_TRANSACTIONS);

        // When the menu finishes hiding and takes its entry off the stack
        await answerMenu(ModalActions.CONFIRM);

        // Then the follow-up does not run a second time, so the row is not toggled back off
        expect(turnOnMobileSelectionMode).toHaveBeenCalledTimes(1);
        expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('leaves selection untouched when the user dismisses the menu', async () => {
        // Given an open menu for a long-pressed row
        const {result} = renderLongPressMenu();
        await longPress(result.current.onLongPressRow);

        // When the user dismisses it without picking "Select"
        await answerMenu(ModalActions.CLOSE);

        // Then selection mode stays off and no row is selected
        expect(turnOnMobileSelectionMode).not.toHaveBeenCalled();
        expect(mockToggle).not.toHaveBeenCalled();
    });

    it('toggles the row directly without opening the menu when selection mode is already on', async () => {
        // Given a list already in selection mode
        const {result} = renderLongPressMenu({isMobileSelectionModeEnabled: true});

        // When the user long presses a row
        await longPress(result.current.onLongPressRow);

        // Then the row is toggled straight away, because the menu only exists to enter selection mode
        expect(mockMenuProps).toBeUndefined();
        expect(mockToggle).toHaveBeenCalledWith(ITEM, ITEM_TRANSACTIONS);
        expect(turnOnMobileSelectionMode).not.toHaveBeenCalled();
    });

    it.each([
        ['long press is suppressed for the view', {shouldPreventLongPressRow: true}, ITEM],
        ['the layout is wide', {isSmallScreenWidth: false}, ITEM],
        ['the row is disabled', {}, {...ITEM, isDisabled: true}],
        ['the row checkbox is disabled', {}, {...ITEM, isDisabledCheckbox: true}],
        ['the row is pending delete', {}, {...ITEM, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
    ] as Array<[string, Partial<HookParams>, SearchListItem]>)('does not open the menu when %s', async (_, params, item) => {
        // Given a row or view that does not allow entering selection mode by long press
        const {result} = renderLongPressMenu(params);

        // When the user long presses the row
        await longPress(result.current.onLongPressRow, item);

        // Then no menu opens and nothing is selected
        expect(mockMenuProps).toBeUndefined();
        expect(mockToggle).not.toHaveBeenCalled();
    });

    it('does not open the menu when the Search screen is not the focused route', async () => {
        // Given another screen on top of the Search list
        mockGetCurrentRoute.mockReturnValue({key: 'another-route'});
        const {result} = renderLongPressMenu();

        // When a long press reaches the list underneath
        await longPress(result.current.onLongPressRow);

        // Then no menu opens, so a hidden list cannot steal the gesture
        expect(mockMenuProps).toBeUndefined();
        expect(mockToggle).not.toHaveBeenCalled();
    });
});
