import {render} from '@testing-library/react-native';

import TextInputFilterContentPopupWrapper from '@components/Search/FilterDropdowns/SearchAdvancedFiltersPopup/TextInputFilterContentPopupWrapper';

import TextInputFilterContentPageWrapper from '@pages/Search/SearchAdvancedFiltersContentPage/TextInputFilterContentPageWrapper';

import CONST from '@src/CONST';

const mockTextInputFilterContent = jest.fn<null, [Record<string, unknown>]>(() => null);
const mockTextInputFilterContentFillHeight = jest.fn<null, [Record<string, unknown>]>(() => null);

jest.mock('@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => mockTextInputFilterContent(props),
    TextInputFilterContentFillHeight: (props: Record<string, unknown>) => mockTextInputFilterContentFillHeight(props),
}));
jest.mock('@hooks/useThemeStyles', () => () => ({pt5: {}, pt6: {}}));

const defaultProps = {
    baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
    value: undefined,
    isNegated: false,
    onChange: jest.fn(),
};

describe('Search text input filter wrappers', () => {
    beforeEach(() => {
        mockTextInputFilterContent.mockClear();
        mockTextInputFilterContentFillHeight.mockClear();
    });

    it('enables fill-height auto-grow in the narrow Search RHP', () => {
        render(<TextInputFilterContentPageWrapper {...defaultProps} />);

        expect(mockTextInputFilterContentFillHeight.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoFocus: true, size: CONST.BUTTON_SIZE.LARGE}));
        expect(mockTextInputFilterContent).not.toHaveBeenCalled();
    });

    it('keeps the wide Search popup compact', () => {
        render(<TextInputFilterContentPopupWrapper {...defaultProps} />);

        expect(mockTextInputFilterContent.mock.calls.at(-1)?.[0]).not.toHaveProperty('shouldFillAvailableHeight');
        expect(mockTextInputFilterContentFillHeight).not.toHaveBeenCalled();
    });
});
