import {act} from '@testing-library/react-native';

/**
 * Test-only wrapper around `BaseSearchList` that still renders the real list, but captures its `onSelectRow` and `data`.
 * The list calls `onSelectRow` when Enter is pressed on its focused row, so this lets a test activate any row the same way,
 * without going through the keyboard handler.
 *
 * Wire it up with `jest.mock('@components/Search/SearchList/BaseSearchList', ...)` returning this module's default export,
 * which is the mocked module, through `jest.requireActual`, and call `resetMockBaseSearchList` in `beforeEach`.
 */
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';

import type React from 'react';

import {createElement} from 'react';

type CapturedListProps = {
    onSelectRow: (item: SearchListItem) => void;
    data: SearchListItem[];
};

const capturedListProps: Partial<CapturedListProps> = {};

// BaseSearchList is mocked with this module, so a plain import would return this mock instead of the real list.
const ActualBaseSearchList = jest.requireActual<{default: React.ComponentType<CapturedListProps>}>('@components/Search/SearchList/BaseSearchList').default;

function MockBaseSearchList(props: CapturedListProps) {
    capturedListProps.onSelectRow = props.onSelectRow;
    capturedListProps.data = props.data;
    return createElement(ActualBaseSearchList, props);
}

/** Calls the list's `onSelectRow` with the first row it renders that matches, the way Enter on the focused row does. */
function activateListRow(isRow: (item: SearchListItem) => boolean, rowDescription: string) {
    const row = capturedListProps.data?.find(isRow);
    if (!row) {
        throw new Error(`No row for ${rowDescription}`);
    }
    act(() => capturedListProps.onSelectRow?.(row));
}

function resetMockBaseSearchList() {
    capturedListProps.onSelectRow = undefined;
    capturedListProps.data = undefined;
}

export default {__esModule: true, default: MockBaseSearchList};
export {activateListRow, resetMockBaseSearchList};
