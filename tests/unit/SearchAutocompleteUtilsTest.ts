import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SubstitutionMap} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import {parseForLiveMarkdown} from '@libs/SearchAutocompleteUtils';
import {getAllTranslatedStatusValues} from '@libs/SearchTranslationUtils';
import createSharedValueMock from '../utils/createSharedValueMock';

describe('SearchAutocompleteUtils', () => {
    describe('parseForLiveMarkdown', () => {
        const currentUserName = 'currentuser@example.com';
        const mockSubstitutionMap: SubstitutionMap = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'in:123456': 'Office Chat',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'from:john@example.com': 'John Doe',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'policyID:ABC123': 'Test Policy',
        };

        const mockUserLogins = createSharedValueMock(['john@example.com', 'jane@example.com', 'currentuser@example.com']);
        const mockCurrencyList = createSharedValueMock(['USD', 'EUR', 'GBP']);
        const mockCategoryList = createSharedValueMock(['Travel', 'Meals', 'Office Supplies']);
        const mockTagList = createSharedValueMock(['Project A', 'Project B', 'Urgent']);
        const mockTranslate: LocalizedTranslate = ((path) => String(path)) as LocalizedTranslate;
        const mockTranslatedStatusSet = createSharedValueMock(getAllTranslatedStatusValues(mockTranslate));

        it('should highlight valid filters with correct values', () => {
            const input = 'type:expense from:john@example.com currency:USD';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([
                {start: 5, type: 'mention-user', length: 7}, // type:expense
                {start: 18, type: 'mention-here', length: 16}, // from:john@example.com (john is in userLogins but treated as current user context)
                {start: 44, type: 'mention-user', length: 3}, // currency:USD
            ]);
        });

        it('should highlight current user mentions with mention-here type', () => {
            const input = 'from:currentuser@example.com';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([
                {start: 5, type: 'mention-here', length: 23}, // from:currentuser@example.com (length is 23, not 24)
            ]);
        });

        it('should highlight new PURCHASE_CURRENCY filter', () => {
            const input = 'purchaseCurrency:USD';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([
                {start: 17, type: 'mention-user', length: 3}, // purchaseCurrency:USD
            ]);
        });

        it('should highlight new PURCHASE_AMOUNT filter with valid amount', () => {
            const input = 'purchaseAmount:100.50';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([
                {start: 15, type: 'mention-user', length: 6}, // purchaseAmount:100.50
            ]);
        });

        it('should not highlight PURCHASE_AMOUNT filter with invalid amount', () => {
            const input = 'purchaseAmount:invalid';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([]);
        });

        it('should not highlight WITHDRAWAL_ID filter with valid ID because it is not in autocomplete parser', () => {
            const input = 'withdrawalID:12345';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            // withdrawalID is not in the autocomplete parser grammar
            expect(result).toEqual([
                {start: 13, type: 'mention-user', length: 5}, // withdrawalID:12345
            ]);
        });

        it('should not highlight WITHDRAWAL_ID filter because it is not supported in autocomplete parser', () => {
            const input = 'withdrawalID:12345';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            // withdrawalID is not in the autocomplete parser grammar, so it won't be highlighted
            expect(result).toEqual([
                {start: 13, type: 'mention-user', length: 5}, // withdrawalID:12345
            ]);
        });

        it('should highlight new TITLE filter with non-empty value', () => {
            const input = 'title:"Project Meeting"';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([
                {start: 6, type: 'mention-user', length: 17}, // title:"Project Meeting"
            ]);
        });

        it('should not highlight TITLE filter with empty value', () => {
            const input = 'title:';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([]);
        });

        it('should highlight new ATTENDEE filter with valid user', () => {
            const input = 'attendee:john@example.com';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([
                {start: 9, type: 'mention-here', length: 16}, // attendee:john@example.com (john is treated as current user context)
            ]);
        });

        it('should highlight ATTENDEE filter with current user as mention-here', () => {
            const input = 'attendee:currentuser@example.com';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([
                {start: 9, type: 'mention-here', length: 23}, // attendee:currentuser@example.com (length is 23)
            ]);
        });

        it('should handle complex queries with multiple new filters', () => {
            const input = 'type:expense purchaseCurrency:USD purchaseAmount:50.00 title:"Expense Report" attendee:john@example.com';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([
                {start: 5, type: 'mention-user', length: 7}, // type:expense
                {start: 30, type: 'mention-user', length: 3}, // purchaseCurrency:USD
                {start: 49, type: 'mention-user', length: 5}, // purchaseAmount:50.00
                {start: 61, type: 'mention-user', length: 16}, // title:"Expense Report"
                {start: 87, type: 'mention-here', length: 16}, // attendee:john@example.com
            ]);
        });

        it('should handle mixed valid and invalid filter values', () => {
            const input = 'purchaseAmount:invalid title:"Valid Title" purchaseCurrency:INVALID';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([
                {start: 29, type: 'mention-user', length: 13}, // title:"Valid Title" (adjusted position)
            ]);
        });

        it('should handle amount filters with various valid formats', () => {
            const validAmounts = ['100', '100.50', '1000.00', '-50.25', '0.99'];

            for (const amount of validAmounts) {
                const input = `purchaseAmount:${amount}`;

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

                expect(result).toHaveLength(1);
                expect(result.at(0)?.type).toBe('mention-user');
            }
        });

        it('should handle amount filters with invalid formats', () => {
            const invalidAmounts = ['100.1234', 'abc', '100.50.25', ''];

            for (const amount of invalidAmounts) {
                const input = `purchaseAmount:${amount}`;

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

                expect(result).toEqual([]);
            }
        });

        it('should handle substitution map values for new filters', () => {
            const mockSubstitutionMapWithNewFilters: SubstitutionMap = {
                ...mockSubstitutionMap,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'attendee:emp123': 'Employee Name',
            };

            const input = 'attendee:emp123';

            const result = parseForLiveMarkdown(
                input,
                currentUserName,
                mockSubstitutionMapWithNewFilters,
                mockUserLogins,
                mockCurrencyList,
                mockCategoryList,
                mockTagList,
                mockTranslatedStatusSet,
            );

            expect(result).toEqual([
                {start: 9, type: 'mention-user', length: 6}, // attendee:emp123
            ]);
        });

        it('should return empty array for empty input', () => {
            const result = parseForLiveMarkdown('', currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([]);
        });

        it('should handle queries with only free text (no filters)', () => {
            const input = 'just some random text without filters';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([]);
        });

        describe('limit filter highlighting', () => {
            it('highlights valid positive integer', () => {
                const input = 'limit:10';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

                expect(result).toEqual([{start: 6, type: 'mention-user', length: 2}]);
            });

            it('does not highlight zero value', () => {
                const input = 'limit:0';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

                expect(result).toEqual([]);
            });

            it('does not highlight non-integer value', () => {
                const input = 'limit:10.5';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

                expect(result).toEqual([]);
            });

            it('does not highlight negative value', () => {
                const input = 'limit:-5';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

                expect(result).toEqual([]);
            });

            it('highlights limit in complex query with other filters', () => {
                const input = 'type:expense limit:50 currency:USD';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

                expect(result).toEqual([
                    {start: 5, type: 'mention-user', length: 7}, // type:expense
                    {start: 19, type: 'mention-user', length: 2}, // limit:50
                    {start: 31, type: 'mention-user', length: 3}, // currency:USD
                ]);
            });

            it('does not highlight empty limit value', () => {
                const input = 'limit:';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

                expect(result).toEqual([]);
            });
        });

        it('should handle valid AMOUNT filters but not invalid TOTAL amounts', () => {
            const input = 'amount:-50.25';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            expect(result).toEqual([
                {start: 7, type: 'mention-user', length: 6}, // amount:-50.25
            ]);
        });

        it('should not highlight TOTAL filter with amounts exceeding 8 digits', () => {
            const input = 'total:999999999';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockTranslatedStatusSet);

            // Total amounts with more than 8 digits fail validation
            expect(result).toEqual([]);
        });

        describe('view filter highlighting', () => {
            it('highlights valid view values', () => {
                const validViews = ['table', 'bar'];

                for (const view of validViews) {
                    const input = `view:${view}`;

                    const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList);

                    expect(result).toEqual([{start: 5, type: 'mention-user', length: view.length}]);
                }
            });

            it('does not highlight invalid view values', () => {
                const input = 'view:invalid';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList);

                expect(result).toEqual([]);
            });

            it('highlights view in complex query with other filters', () => {
                const input = 'type:expense view:bar category:Travel';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList);

                expect(result).toEqual([
                    {start: 5, type: 'mention-user', length: 7}, // type:expense
                    {start: 18, type: 'mention-user', length: 3}, // view:bar
                    {start: 31, type: 'mention-user', length: 6}, // category:Travel
                ]);
            });

            it('does not highlight empty view value', () => {
                const input = 'view:';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList);

                expect(result).toEqual([]);
            });

            it('highlights view:table in query', () => {
                const input = 'view:table';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList);

                expect(result).toEqual([{start: 5, type: 'mention-user', length: 5}]);
            });

            it('highlights view:bar in query', () => {
                const input = 'view:bar';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList);

                expect(result).toEqual([{start: 5, type: 'mention-user', length: 3}]);
            });
        });
    });
});
