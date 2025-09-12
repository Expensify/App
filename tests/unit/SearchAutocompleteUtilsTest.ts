import {filterOutRangesWithCorrectValue, parseForLiveMarkdown} from '@libs/SearchAutocompleteUtils';
import {useSharedValue} from 'react-native-reanimated';
import CONST from '@src/CONST';

// Mock useSharedValue for testing
jest.mock('react-native-reanimated', () => ({
    useSharedValue: jest.fn(),
}));

// Mock the parser to avoid CONST reference issues in jest.mock
jest.mock('@libs/SearchParser/autocompleteParser', () => ({
    parse: jest.fn(),
}));

const mockUseSharedValue = useSharedValue as jest.MockedFunction<typeof useSharedValue>;
const mockParse = require('@libs/SearchParser/autocompleteParser').parse;

describe('SearchAutocompleteUtils', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockUseSharedValue.mockClear();
        mockParse.mockClear();
    });

    describe('filterOutRangesWithCorrectValue', () => {
        it('should accept "me" as a valid value for user-related filter keys', () => {
            const mockUserLogins = {
                get: () => ['user1@example.com', 'user2@example.com'],
                set: jest.fn(),
            };

            const mockCurrencyList = {get: () => [], set: jest.fn()};
            const mockCategoryList = {get: () => [], set: jest.fn()};
            const mockTagList = {get: () => [], set: jest.fn()};

            const userFilterKeys = [
                CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
                CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE,
                CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER,
                CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER,
            ];

            userFilterKeys.forEach((key) => {
                const range = {
                    key,
                    value: 'me',
                    start: 0,
                    length: 2,
                };

                const result = filterOutRangesWithCorrectValue(
                    range,
                    {},
                    mockUserLogins as any,
                    mockCurrencyList as any,
                    mockCategoryList as any,
                    mockTagList as any,
                );

                expect(result).toBe(true);
            });
        });

        it('should accept regular user emails for user-related filter keys', () => {
            const mockUserLogins = {
                get: () => ['user1@example.com', 'user2@example.com'],
                set: jest.fn(),
            };

            const mockCurrencyList = {get: () => [], set: jest.fn()};
            const mockCategoryList = {get: () => [], set: jest.fn()};
            const mockTagList = {get: () => [], set: jest.fn()};

            const range = {
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                value: 'user1@example.com',
                start: 0,
                length: 17,
            };

            const result = filterOutRangesWithCorrectValue(
                range,
                {},
                mockUserLogins as any,
                mockCurrencyList as any,
                mockCategoryList as any,
                mockTagList as any,
            );

            expect(result).toBe(true);
        });
    });

    describe('parseForLiveMarkdown', () => {
        it('should highlight "me" as current user mention', () => {
            const mockUserLogins = {
                get: () => ['user1@example.com'],
                set: jest.fn(),
            };

            const mockCurrencyList = {get: () => [], set: jest.fn()};
            const mockCategoryList = {get: () => [], set: jest.fn()};
            const mockTagList = {get: () => [], set: jest.fn()};

            // Setup the parse mock to return a simple range for "me"
            mockParse.mockReturnValue({
                ranges: [{
                    key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                    value: 'me',
                    start: 5,
                    length: 2,
                }],
            });

            const result = parseForLiveMarkdown(
                'from:me',
                'CurrentUser',
                {},
                mockUserLogins as any,
                mockCurrencyList as any,
                mockCategoryList as any,
                mockTagList as any,
            );

            expect(result).toEqual([{
                start: 5,
                type: 'mention-here',
                length: 2,
            }]);
        });
    });
});
