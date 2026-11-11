import {renderHook} from '@testing-library/react-native';

import useFlatNavSidebarRowProps from '@components/Navigation/FlatNavigationBar/useFlatNavSidebarRowProps';

const MOCK_STYLES = {
    textSupporting: {color: '#supporting'},
    themeTextColor: {color: '#text'},
    hoveredComponentBG: {backgroundColor: '#selected'},
    highlightBG: {backgroundColor: '#hovered'},
};

let mockShouldUseFlatNavigationBar = false;

jest.mock('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar', () => ({
    __esModule: true,
    default: () => mockShouldUseFlatNavigationBar,
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: jest.fn(() => MOCK_STYLES),
}));

describe('useFlatNavSidebarRowProps', () => {
    beforeEach(() => {
        mockShouldUseFlatNavigationBar = false;
    });

    it.each([true, false])('overrides nothing when the flat navigation bar is not shown (selected: %s)', (isSelected) => {
        // Given a user outside the flatNav beta, so the bar is not shown
        const {result} = renderHook(() => useFlatNavSidebarRowProps());

        // When a sidebar row asks for its props
        const rowProps = result.current(isSelected);

        // Then it gets none, because every sidebar falls back to its own default look and must render as it does on main
        expect(rowProps).toEqual({});
    });

    it('gives a selected row the bar selected background and its default bold title', () => {
        // Given the flat navigation bar is shown
        mockShouldUseFlatNavigationBar = true;
        const {result} = renderHook(() => useFlatNavSidebarRowProps());

        // When a selected row asks for its props
        const rowProps = result.current(true);

        // Then the row matches the bar's selected row, which keeps a bold label in the default text color
        expect(rowProps).toEqual({
            shouldShowBasicTitle: false,
            titleStyle: undefined,
            hoveredTitleStyle: undefined,
            selectedStyle: MOCK_STYLES.hoveredComponentBG,
            hoveredStyle: MOCK_STYLES.highlightBG,
        });
    });

    it('gives a row that is not selected a regular weight supporting colored title that turns to the default color on hover, and no selected background', () => {
        // Given the flat navigation bar is shown
        mockShouldUseFlatNavigationBar = true;
        const {result} = renderHook(() => useFlatNavSidebarRowProps());

        // When a row that is not selected asks for its props
        const rowProps = result.current(false);

        // Then the row matches the bar's rows that are not selected, which use regular weight and the supporting text color, and the default text color on hover
        expect(rowProps).toEqual({
            shouldShowBasicTitle: true,
            titleStyle: MOCK_STYLES.textSupporting,
            hoveredTitleStyle: MOCK_STYLES.themeTextColor,
            selectedStyle: undefined,
            hoveredStyle: MOCK_STYLES.highlightBG,
        });
    });
});
