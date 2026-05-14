import React from 'react';
import {render} from '@testing-library/react-native';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';

const mockFocusableMenuItem = jest.fn(() => null);
jest.mock('@components/FocusableMenuItem', () => (props: unknown) => mockFocusableMenuItem(props));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({mr3: {marginRight: 12}}),
}));

jest.mock('@pages/inbox/sidebar/FABPopoverContent/useFABMenuItem', () => ({
    __esModule: true,
    default: () => ({
        itemIndex: 0,
        isFocused: false,
        wrapperStyle: {},
        setFocusedIndex: jest.fn(),
        onItemPress: jest.fn(),
    }),
}));

describe('FABFocusableMenuItem', () => {
    beforeEach(() => {
        mockFocusableMenuItem.mockClear();
    });

    it('adds right margin to the icon container', () => {
        render(
            <FABFocusableMenuItem
                itemId="new-workspace"
                icon={'MockIcon' as never}
                title="New workspace"
            />,
        );

        expect(mockFocusableMenuItem).toHaveBeenCalled();
        const props = mockFocusableMenuItem.mock.calls[0][0] as {iconStyles?: unknown};
        expect(Array.isArray(props.iconStyles)).toBe(true);
        expect((props.iconStyles as unknown[])[0]).toEqual({marginRight: 12});
    });
});
