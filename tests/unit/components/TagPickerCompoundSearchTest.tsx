import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type SelectionList from '@components/SelectionList/SelectionListWithSections';
import type {SelectionListViewportProps} from '@components/SelectionList/SelectionListWithSections/SelectionListViewport';
import type {ListItem} from '@components/SelectionList/SelectionListWithSections/types';
import TagPicker from '@components/TagPicker';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';

import type Navigation from '@libs/Navigation/Navigation';
import * as TagsOptionsListUtils from '@libs/TagsOptionsListUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentProps} from 'react';

import React, {Suspense} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockListCommit = jest.fn<void, [SelectionListViewportProps<ListItem>]>();
const mockInputCommit = jest.fn<void, [string, number, number, (query: string) => void]>();
const mockRenderFlashList = jest.fn(() => null);
let mockPendingFinanceResults: Promise<void> | undefined;
let mockOnViewportCommit: ((props: SelectionListViewportProps<ListItem>) => void) | undefined;
jest.mock('@components/SelectionList/SelectionListWithSections', () => {
    const ActualSelectionList = jest.requireActual<{default: typeof SelectionList}>('@components/SelectionList/SelectionListWithSections').default;
    const {Viewport: ActualViewport, SearchInput: ActualSearchInput} = ActualSelectionList;
    const {createElement, use, useLayoutEffect} = jest.requireActual<typeof React>('react');
    const {getTagListSections} = jest.requireMock<typeof TagsOptionsListUtils>('@libs/TagsOptionsListUtils');
    return {
        __esModule: true,
        default: Object.assign(ActualSelectionList, {
            Viewport: TrackedViewport,
            SearchInput: TrackedSearchInput,
        }),
    };

    function TrackedViewport(props: SelectionListViewportProps<ListItem>) {
        if (mockPendingFinanceResults && props.searchQuery === 'Fin') {
            use(mockPendingFinanceResults);
        }
        useLayoutEffect(() => {
            mockListCommit(props);
            mockOnViewportCommit?.(props);
        }, [props]);
        return createElement(ActualViewport<ListItem>, props);
    }

    function TrackedSearchInput(props: ComponentProps<typeof SelectionList.SearchInput>) {
        const {value, onChangeText} = props;
        useLayoutEffect(() => {
            mockInputCommit(value, jest.mocked(getTagListSections).mock.calls.length, mockRenderFlashList.mock.calls.length, onChangeText);
        }, [value, onChangeText]);
        return createElement(ActualSearchInput, props);
    }
});

jest.mock('@shopify/flash-list', () => ({FlashList: () => mockRenderFlashList()}));
jest.mock('@libs/TagsOptionsListUtils', () => {
    const actual = jest.requireActual<typeof TagsOptionsListUtils>('@libs/TagsOptionsListUtils');
    return {...actual, getTagListSections: jest.fn(actual.getTagListSections)};
});
jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());
jest.mock('@libs/actions/Policy/Tag', () => ({openPolicyTagsPage: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof Navigation>('@react-navigation/native'),
    useIsFocused: () => true,
    useFocusEffect: jest.fn(),
    useNavigation: () => ({isFocused: () => true, addListener: () => () => {}}),
}));

const SEARCH_INPUT_ID = 'selection-list-text-input';
const POLICY_ID = 'tag-picker-test';

function renderSearchablePicker(onSubmit: jest.Mock, tags = ['Engineering', 'Finance']) {
    return render(
        <Suspense fallback={null}>
            <TagPicker
                policyID={undefined}
                selectedTag=""
                tagListName="Department"
                tagListIndex={0}
                onSubmit={onSubmit}
                additionalTagsToInclude={tags}
                searchInputThreshold={2}
            />
        </Suspense>,
    );
}

function getEnterShortcut() {
    const enterShortcut = jest.mocked(useKeyboardShortcut).mock.calls.findLast(([shortcut]) => shortcut === CONST.KEYBOARD_SHORTCUTS.ENTER);
    expect(enterShortcut?.[2]?.isActive).toBe(true);
    return enterShortcut?.[1];
}

function pressEnterShortcut() {
    const enterShortcut = getEnterShortcut();
    act(() => enterShortcut?.(new KeyboardEvent('keydown', {key: 'Enter'})));
}

function submitSearchInput() {
    fireEvent(screen.getByTestId(SEARCH_INPUT_ID), 'submitEditing');
}

describe('TagPicker', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockPendingFinanceResults = undefined;
        mockOnViewportCommit = undefined;
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it.each([
        ['the desktop Enter shortcut', pressEnterShortcut],
        ['the native search submit action', submitSearchInput],
    ])('selects from the latest query with %s', async (_name, submitSearch) => {
        // Given Engineering is the focused result of the current search.
        const onSubmit = jest.fn();
        renderSearchablePicker(onSubmit);
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByTestId(SEARCH_INPUT_ID), 'Eng');

        // When the user replaces the query and submits after the matching results render.
        fireEvent.changeText(screen.getByTestId(SEARCH_INPUT_ID), 'Fin');
        submitSearch();

        // Then only the new match is selected.
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({keyForList: 'Finance'}));
    });

    it.each([
        ['the desktop Enter shortcut', pressEnterShortcut],
        ['the native search submit action', submitSearchInput],
    ])('keeps the visible result selectable with %s until the new results render', async (_name, submitSearch) => {
        // Given Engineering is visible and the Finance results cannot finish rendering yet.
        const onSubmit = jest.fn();
        renderSearchablePicker(onSubmit);
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByTestId(SEARCH_INPUT_ID), 'Eng');
        const {promise, resolve} = Promise.withResolvers<void>();
        mockPendingFinanceResults = promise;
        const filterCalls = jest.mocked(TagsOptionsListUtils.getTagListSections).mock.calls.length;
        const listRenders = mockRenderFlashList.mock.calls.length;

        // When the user types a new query and presses Enter before its results render.
        await act(async () => {
            mockInputCommit.mock.lastCall?.[3]('Fin');
        });
        expect(screen.getByTestId(SEARCH_INPUT_ID)).toHaveProp('value', 'Fin');
        expect(mockInputCommit).toHaveBeenCalledWith('Fin', filterCalls, listRenders, expect.any(Function));
        submitSearch();

        // Then Enter selects Engineering from the visible list, and Finance only becomes selectable after it renders.
        expect(onSubmit).toHaveBeenNthCalledWith(1, expect.objectContaining({keyForList: 'Engineering'}));
        await act(async () => {
            resolve();
        });
        submitSearch();
        expect(onSubmit).toHaveBeenNthCalledWith(2, expect.objectContaining({keyForList: 'Finance'}));
        expect(onSubmit).toHaveBeenCalledTimes(2);
    });

    it('does not select a stale result when the query has no matches', async () => {
        // Given Engineering is the focused result of the current search.
        const onSubmit = jest.fn();
        renderSearchablePicker(onSubmit);
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByTestId(SEARCH_INPUT_ID), 'Eng');

        // When the user searches for a nonexistent tag and presses Enter after the empty results render.
        fireEvent.changeText(screen.getByTestId(SEARCH_INPUT_ID), 'Unknown');
        submitSearchInput();

        // Then the list shows no matches and does not submit Engineering.
        expect(onSubmit).not.toHaveBeenCalled();
        expect(mockListCommit.mock.lastCall?.[0].sections.flatMap(({data}) => data)).toEqual([]);
    });

    it('uses the new query focus even before the viewport effects run', async () => {
        // Given keyboard focus is on the second row of the old results.
        const onSubmit = jest.fn();
        renderSearchablePicker(onSubmit, ['East Alpha', 'East Beta', 'West Alpha', 'West Beta']);
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByTestId(SEARCH_INPUT_ID), 'East');
        const arrowDown = jest.mocked(useKeyboardShortcut).mock.calls.findLast(([shortcut]) => shortcut === CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN)?.[1];
        act(() => arrowDown?.(new KeyboardEvent('keydown', {key: 'ArrowDown'})));
        const previousShortcut = getEnterShortcut();
        pressEnterShortcut();
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({keyForList: 'East Beta'}));
        onSubmit.mockClear();

        // When the new results commit and the previous Enter listener runs before passive focus sync.
        mockOnViewportCommit = ({searchQuery}) => {
            if (searchQuery !== 'West') {
                return;
            }
            mockOnViewportCommit = undefined;
            previousShortcut?.(new KeyboardEvent('keydown', {key: 'Enter'}));
        };
        fireEvent.changeText(screen.getByTestId(SEARCH_INPUT_ID), 'West');

        // Then selection uses the first newly focused result, not the old focus index.
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({keyForList: 'West Alpha'}));
    });

    it('never commits the previous tags when a same-named list takes its index', async () => {
        // Given two lists share the same display name but have different Onyx entry keys.
        const policyTagsKey = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}` as const;
        await Onyx.set(policyTagsKey, {
            Department: {name: 'Department', orderWeight: 0, required: false, tags: {Finance: {name: 'Finance', enabled: true}}},
            DepartmentSecond: {name: 'Department', orderWeight: 1, required: false, tags: {Europe: {name: 'Europe', enabled: true}}},
        });
        render(
            <TagPicker
                policyID={POLICY_ID}
                selectedTag=""
                tagListName="Department"
                tagListIndex={0}
                onSubmit={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(mockListCommit.mock.lastCall?.[0].sections.at(0)?.data.at(0)?.keyForList).toBe('Finance');
        mockListCommit.mockClear();

        // When the first list is removed and the other moves into the same index.
        await act(async () => {
            await Onyx.set(policyTagsKey, {
                DepartmentSecond: {name: 'Department', orderWeight: 0, required: false, tags: {Europe: {name: 'Europe', enabled: true}}},
            });
            await waitForBatchedUpdates();
        });

        // Then the first committed viewport already has the replacement's rows.
        expect(mockListCommit.mock.calls.at(0)?.[0].sections.at(0)?.data.at(0)?.keyForList).toBe('Europe');
    });

    it('never commits the previous policy tag list when switching list index', async () => {
        // Given one policy with two different tag lists.
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, {
            Department: {name: 'Department', orderWeight: 0, required: false, tags: {Finance: {name: 'Finance', enabled: true}}},
            Region: {name: 'Region', orderWeight: 1, required: false, tags: {Europe: {name: 'Europe', enabled: true}}},
        });
        const onSubmit = jest.fn();
        const {rerender} = render(
            <TagPicker
                policyID={POLICY_ID}
                selectedTag=""
                tagListName="Department"
                tagListIndex={0}
                onSubmit={onSubmit}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(mockListCommit.mock.lastCall?.[0].sections.at(0)?.data.at(0)?.keyForList).toBe('Finance');
        mockListCommit.mockClear();

        // When the same mounted picker starts selecting a region.
        rerender(
            <TagPicker
                policyID={POLICY_ID}
                selectedTag=""
                tagListName="Region"
                tagListIndex={1}
                onSubmit={onSubmit}
            />,
        );

        // Then every commit for the new list uses region rows, even before deferral catches up.
        expect(mockListCommit.mock.calls.length).toBeGreaterThan(0);
        expect(mockListCommit.mock.calls.flatMap(([{sections}]) => sections.flatMap(({data}) => data.map(({keyForList}) => keyForList)))).not.toContain('Finance');
        expect(mockListCommit.mock.lastCall?.[0].sections.at(0)?.data.at(0)?.keyForList).toBe('Europe');
    });

    it('keeps the skeleton until the loaded tags can render', async () => {
        // Given a lazy-loaded workspace whose picker only knows the selected tag.
        const onRenderedRowCountChange = jest.fn();
        render(
            <TagPicker
                policyID={POLICY_ID}
                selectedTag="Engineering"
                tagListName="Department"
                tagListIndex={0}
                onSubmit={jest.fn()}
                onRenderedRowCountChange={onRenderedRowCountChange}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(mockListCommit.mock.lastCall?.[0].loading).toBeDefined();
        expect(onRenderedRowCountChange).not.toHaveBeenCalled();
        mockListCommit.mockClear();

        // When the policy tags arrive in Onyx.
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, {
                Department: {name: 'Department', orderWeight: 0, required: false, tags: {Finance: {name: 'Finance', enabled: true}}},
            });
            await waitForBatchedUpdates();
        });

        // Then the first non-loading commit already contains a real policy tag.
        const firstLoadedList = mockListCommit.mock.calls.find(([props]) => !props.loading)?.[0];
        expect(firstLoadedList?.sections.flatMap(({data}) => data.map(({keyForList}) => keyForList))).toContain('Finance');
        expect(onRenderedRowCountChange).toHaveBeenCalledWith(2);
    });
});
