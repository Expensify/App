import {act, render, waitFor} from '@testing-library/react-native';

import SearchSelectAllMenu from '@components/Search/SearchList/SearchSelectAllMenu';

import React from 'react';

type MockCheckboxProps = {
    onPress: () => void;
    ref?: {current: unknown};
};

const mockCheckbox: {current: MockCheckboxProps | null} = {current: null};
const mockPopoverMenu: {isVisible: boolean | undefined} = {isVisible: undefined};

jest.mock('@components/Checkbox', () => ({
    __esModule: true,
    default: (props: MockCheckboxProps) => {
        mockCheckbox.current = props;
        const anchorRef = props.ref;
        if (anchorRef) {
            // The menu anchors to the checkbox, so it needs something to measure.
            anchorRef.current = {};
        }
        return null;
    },
}));
jest.mock('@components/PopoverMenu', () => ({
    __esModule: true,
    default: ({isVisible}: {isVisible: boolean}) => {
        mockPopoverMenu.isVisible = isVisible;
        return null;
    },
}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => new Proxy({}, {get: () => ({})})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/usePopoverPosition', () => ({
    __esModule: true,
    default: () => ({calculatePopoverPosition: () => Promise.resolve({horizontal: 0, vertical: 0})}),
}));

function renderMenu(hasMoreMatchingItems: boolean, onAllCheckboxPress: () => void) {
    return render(
        <SearchSelectAllMenu
            isSelectAllChecked={false}
            isIndeterminate={false}
            selectedItemsLength={0}
            totalItems={50}
            hasMoreMatchingItems={hasMoreMatchingItems}
            shouldShowTextButton={false}
            onAllCheckboxPress={onAllCheckboxPress}
        />,
    );
}

describe('SearchSelectAllMenu', () => {
    beforeEach(() => {
        mockCheckbox.current = null;
        mockPopoverMenu.isVisible = undefined;
    });

    it('selects the rows directly when nothing matches past this page, so no select-all menu opens', () => {
        // Given a page that already holds every matching row, as after a submit takes a full page plus one down to a full page
        const onAllCheckboxPress = jest.fn();
        renderMenu(false, onAllCheckboxPress);

        // When the select-all checkbox is pressed
        act(() => mockCheckbox.current?.onPress());

        // Then the rows are selected right away instead of offering a choice that would select the same rows
        expect(onAllCheckboxPress).toHaveBeenCalledTimes(1);
        expect(mockPopoverMenu.isVisible).toBe(false);
    });

    it('offers selecting every match when more rows match than this page shows', async () => {
        // Given more matching rows than the page shows
        const onAllCheckboxPress = jest.fn();
        renderMenu(true, onAllCheckboxPress);

        // When the select-all checkbox is pressed
        act(() => mockCheckbox.current?.onPress());

        // Then the menu opens to choose between this page and every match, and nothing is selected yet
        await waitFor(() => expect(mockPopoverMenu.isVisible).toBe(true));
        expect(onAllCheckboxPress).not.toHaveBeenCalled();
    });
});
