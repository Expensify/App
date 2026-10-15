import {render} from '@testing-library/react-native';

import type * as TextInputFilterContentModule from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';
import TextInputFilterContentPopupWrapper from '@components/Search/FilterDropdowns/SearchAdvancedFiltersPopup/TextInputFilterContentPopupWrapper';

import TextInputFilterContentPageWrapper from '@pages/Search/SearchAdvancedFiltersContentPage/TextInputFilterContentPageWrapper';

import CONST from '@src/CONST';

const mockTextInputFilterContent = jest.fn<null, [Record<string, unknown>]>(() => null);
const mockTextInputFilterContentFillHeight = jest.fn<null, [Record<string, unknown>]>(() => null);

jest.mock('@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent', () => ({
    ...jest.requireActual<typeof TextInputFilterContentModule>('@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent'),
    __esModule: true,
    default: (props: Record<string, unknown>) => mockTextInputFilterContent(props),
    TextInputFilterContentFillHeight: (props: Record<string, unknown>) => mockTextInputFilterContentFillHeight(props),
}));
jest.mock('@hooks/useThemeStyles', () => () => ({pt5: {}, pt6: {}}));

const defaultProps = {
    baseFilterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
    value: undefined,
    isNegated: false,
    buttonText: 'Save filter',
    onChange: jest.fn(),
};

describe('Search text input filter wrappers', () => {
    beforeEach(() => {
        mockTextInputFilterContent.mockClear();
        mockTextInputFilterContentFillHeight.mockClear();
    });

    describe.each([
        ['narrow RHP', TextInputFilterContentPageWrapper],
        ['wide popup', TextInputFilterContentPopupWrapper],
    ] as const)('%s', (_name, Wrapper) => {
        it.each([CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE])('allows %s to grow', (baseFilterKey) => {
            // Given a prose filter in either supported Search layout.
            // When its editor is opened with the existing action and value.
            render(
                <Wrapper
                    {...defaultProps}
                    baseFilterKey={baseFilterKey}
                    value="Long prose"
                />,
            );
            // Then it uses bounded growth and retains its editing contract.
            expect(mockTextInputFilterContentFillHeight.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({baseFilterKey, value: 'Long prose', onChange: defaultProps.onChange}));
            expect(mockTextInputFilterContent).not.toHaveBeenCalled();
        });

        it.each([
            CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTER_USER_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTER_PAYROLL_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.ORDER_DEAL_NUMBERS,
        ])('keeps %s compact', (baseFilterKey) => {
            // Given a structured or short-text filter, regardless of layout.
            // When that editor opens.
            render(
                <Wrapper
                    {...defaultProps}
                    baseFilterKey={baseFilterKey}
                />,
            );
            // Then it cannot take the growing-input path.
            expect(mockTextInputFilterContent.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({baseFilterKey, onChange: defaultProps.onChange}));
            expect(mockTextInputFilterContentFillHeight).not.toHaveBeenCalled();
        });
    });
});
