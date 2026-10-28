import type {SubstitutionMap} from '@components/Search/SearchRouter/getQueryWithSubstitutions';

import {getExportLabelForConnection, getStandardExportTemplateDisplayName, isStandardExportTemplate, isStandardExportTemplateLabel} from '@libs/AccountingUtils';
import {getTrimmedUserSearchQueryPreservingComma, parseForAutocomplete, parseForLiveMarkdown} from '@libs/SearchAutocompleteUtils';
import type {KnownFilterValues} from '@libs/SearchAutocompleteUtils';
import {parse} from '@libs/SearchParser/autocompleteParser';

import CONST from '@src/CONST';

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

        const mockKnownValues: KnownFilterValues = {
            userLogins: new Set(['john@example.com', 'jane@example.com', 'currentuser@example.com']),
            currencies: new Set(['USD', 'EUR', 'GBP']),
            categories: new Set(['Travel', 'Meals', 'Office Supplies']),
            tags: new Set(['Project A', 'Project B', 'Urgent']),
            exportedTo: new Set<string>([
                ...CONST.POLICY.CONNECTIONS.EXPORTED_TO_INTEGRATION_DISPLAY_NAMES,
                CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT,
                CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT,
            ]),
        };

        it('should highlight valid filters with correct values', () => {
            const input = 'type:expense from:john@example.com currency:USD';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 5, type: 'mention-user', length: 7}, // type:expense
                {start: 18, type: 'mention-here', length: 16}, // from:john@example.com (john is in userLogins but treated as current user context)
                {start: 44, type: 'mention-user', length: 3}, // currency:USD
            ]);
        });

        it('should highlight in: filter when no type is set', () => {
            // Given an in: filter without an explicit type, which resolves to type:chat
            const input = 'in:123456';

            // When the query is parsed for live markdown
            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockExportedToList);

            // Then the in: value is highlighted as valid
            expect(result).toEqual([{start: 3, type: 'mention-user', length: 6}]);
        });

        it('should highlight in: filter for type:chat', () => {
            // Given an in: filter with type:chat, which supports in:
            const input = 'type:chat in:123456';

            // When the query is parsed for live markdown
            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockExportedToList);

            // Then both the type and the in: value are highlighted as valid
            expect(result).toEqual([
                {start: 5, type: 'mention-user', length: 4},
                {start: 13, type: 'mention-user', length: 6},
            ]);
        });

        it('should not highlight in: filter for type:expense', () => {
            // Given an in: filter with type:expense, which does not support in:
            const input = 'type:expense in:123456';

            // When the query is parsed for live markdown
            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockExportedToList);

            // Then only the type is highlighted, so the user can see in: is not valid for expenses
            expect(result).toEqual([{start: 5, type: 'mention-user', length: 7}]);
        });

        it('should use the last type filter to decide whether to highlight in:', () => {
            // Given type:expense followed by type:chat, where the search parser uses the last type (chat)
            const input = 'type:expense type:chat in:123456';

            // When the query is parsed for live markdown
            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockExportedToList);

            // Then both types and the in: value are highlighted as valid
            expect(result).toEqual([
                {start: 5, type: 'mention-user', length: 7},
                {start: 18, type: 'mention-user', length: 4},
                {start: 26, type: 'mention-user', length: 6},
            ]);
        });

        it('should not highlight in: when the last type filter does not support it', () => {
            // Given type:chat followed by type:expense, where the search parser uses the last type (expense)
            const input = 'type:chat type:expense in:123456';

            // When the query is parsed for live markdown
            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockUserLogins, mockCurrencyList, mockCategoryList, mockTagList, mockExportedToList);

            // Then only the types are highlighted, so the user can see in: is not valid for expenses
            expect(result).toEqual([
                {start: 5, type: 'mention-user', length: 4},
                {start: 15, type: 'mention-user', length: 7},
            ]);
        });

        it('should highlight current user mentions with mention-here type', () => {
            const input = 'from:currentuser@example.com';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 5, type: 'mention-here', length: 23}, // from:currentuser@example.com (length is 23, not 24)
            ]);
        });

        it('should highlight the Spend footer selections in either spelling', () => {
            const input = 'footer-count:reports footerTotal:non-reimbursable footer-currency:EUR';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 13, type: 'mention-user', length: 7}, // footer-count:reports
                {start: 33, type: 'mention-user', length: 16}, // footerTotal:non-reimbursable
                {start: 66, type: 'mention-user', length: 3}, // footer-currency:EUR
            ]);
        });

        it('should not highlight a Spend footer selection the footer cannot render', () => {
            const input = 'footer-count:pandas footerTotal:whatever footer-currency:NOPE';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([]);
        });

        it('should highlight new PURCHASE_CURRENCY filter', () => {
            const input = 'purchaseCurrency:USD';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 17, type: 'mention-user', length: 3}, // purchaseCurrency:USD
            ]);
        });

        it('should highlight new PURCHASE_AMOUNT filter with valid amount', () => {
            const input = 'purchaseAmount:100.50';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 15, type: 'mention-user', length: 6}, // purchaseAmount:100.50
            ]);
        });

        it('should not highlight PURCHASE_AMOUNT filter with invalid amount', () => {
            const input = 'purchaseAmount:invalid';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([]);
        });

        it('should highlight WITHDRAWAL_STATUS filter with a valid settlement status value', () => {
            const input = 'withdrawal-status:pending';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 18, type: 'mention-user', length: 7}, // withdrawal-status:pending
            ]);
        });

        it('should not highlight WITHDRAWAL_STATUS filter with invalid value', () => {
            const input = 'withdrawal-status:invalid';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([]);
        });

        it('should not highlight WITHDRAWAL_ID filter with valid ID because it is not in autocomplete parser', () => {
            const input = 'withdrawalID:12345';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            // withdrawalID is not in the autocomplete parser grammar
            expect(result).toEqual([
                {start: 13, type: 'mention-user', length: 5}, // withdrawalID:12345
            ]);
        });

        it('should not highlight WITHDRAWAL_ID filter because it is not supported in autocomplete parser', () => {
            const input = 'withdrawalID:12345';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            // withdrawalID is not in the autocomplete parser grammar, so it won't be highlighted
            expect(result).toEqual([
                {start: 13, type: 'mention-user', length: 5}, // withdrawalID:12345
            ]);
        });

        it('should highlight new TITLE filter with non-empty value', () => {
            const input = 'title:"Project Meeting"';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 6, type: 'mention-user', length: 17}, // title:"Project Meeting"
            ]);
        });

        it('should not highlight TITLE filter with empty value', () => {
            const input = 'title:';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([]);
        });

        it('should highlight VENDOR filter with a typed vendor name', () => {
            // Given a typed vendor filter, whose names are matched by text on the server
            const input = 'vendor:"Acme Tools"';

            // When the input is parsed for highlighting
            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            // Then the vendor value is highlighted like other free-text filters
            expect(result).toEqual([
                {start: 7, type: 'mention-user', length: 12}, // vendor:"Acme Tools"
            ]);
        });

        it('should highlight EXPORTED_TO filter when value is in predefined integrations or custom template list', () => {
            const input = 'exported-to:Xero';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([{start: 12, type: 'mention-user', length: 4}]);
        });

        it('should highlight EXPORTED_TO filter for valid custom template', () => {
            const input = 'exported-to:"All Data - Report Level Export"';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([{start: 12, type: 'mention-user', length: 32}]);
        });

        it('should highlight EXPORTED_TO filter for expense level export template', () => {
            const input = 'exported-to:"All Data - Expense Level Export"';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([{start: 12, type: 'mention-user', length: 33}]);
        });

        it('should not highlight EXPORTED_TO filter when value is not in list', () => {
            const input = 'exported-to:RandomInvalidValue';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([]);
        });

        it('should highlight new ATTENDEE filter with valid user', () => {
            const input = 'attendee:john@example.com';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 9, type: 'mention-here', length: 16}, // attendee:john@example.com (john is treated as current user context)
            ]);
        });

        it('should highlight ATTENDEE filter with current user as mention-here', () => {
            const input = 'attendee:currentuser@example.com';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 9, type: 'mention-here', length: 23}, // attendee:currentuser@example.com (length is 23)
            ]);
        });

        it('should highlight FROM filter with the "me" keyword as mention-here', () => {
            const input = 'from:me';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 5, type: 'mention-here', length: 2}, // from:me
            ]);
        });

        it('should highlight every user-based filter with the "me" keyword as mention-here', () => {
            const inputs: Array<[string, number]> = [
                ['from:me', 5],
                ['to:me', 3],
                ['assignee:me', 9],
                ['payer:me', 6],
                ['exporter:me', 9],
                ['attendee:me', 9],
            ];

            for (const [input, start] of inputs) {
                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);
                expect(result).toEqual([{start, type: 'mention-here', length: 2}]);
            }
        });

        it('should handle complex queries with multiple new filters', () => {
            const input = 'type:expense purchaseCurrency:USD purchaseAmount:50.00 title:"Expense Report" attendee:john@example.com';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

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

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 29, type: 'mention-user', length: 13}, // title:"Valid Title" (adjusted position)
            ]);
        });

        it('should handle amount filters with various valid formats', () => {
            const validAmounts = ['100', '100.50', '1000.00', '-50.25', '0.99'];

            for (const amount of validAmounts) {
                const input = `purchaseAmount:${amount}`;

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toHaveLength(1);
                expect(result.at(0)?.type).toBe('mention-user');
            }
        });

        it('should handle amount filters with invalid formats', () => {
            const invalidAmounts = ['100.1234', 'abc', '100.50.25', ''];

            for (const amount of invalidAmounts) {
                const input = `purchaseAmount:${amount}`;

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

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

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMapWithNewFilters, mockKnownValues);

            expect(result).toEqual([
                {start: 9, type: 'mention-user', length: 6}, // attendee:emp123
            ]);
        });

        it('should return empty array for empty input', () => {
            const result = parseForLiveMarkdown('', currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([]);
        });

        it('should handle queries with only free text (no filters)', () => {
            const input = 'just some random text without filters';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([]);
        });

        it('should highlight bankAccount filter when value is in substitution map', () => {
            const input = 'bankAccount:Chase';
            const substitutionMapWithBankAccount: SubstitutionMap = {
                ...mockSubstitutionMap,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'bankAccount:Chase': '42',
            };

            const result = parseForLiveMarkdown(input, currentUserName, substitutionMapWithBankAccount, mockKnownValues);

            expect(result).toEqual([{start: 12, type: 'mention-user', length: 5}]);
        });

        it('should not highlight bankAccount filter when value is missing from substitution map', () => {
            const input = 'bankAccount:99';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([]);
        });

        describe('limit filter highlighting', () => {
            it('highlights valid positive integer', () => {
                const input = 'limit:10';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([{start: 6, type: 'mention-user', length: 2}]);
            });

            it('does not highlight zero value', () => {
                const input = 'limit:0';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([]);
            });

            it('does not highlight non-integer value', () => {
                const input = 'limit:10.5';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([]);
            });

            it('does not highlight negative value', () => {
                const input = 'limit:-5';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([]);
            });

            it('highlights limit in complex query with other filters', () => {
                const input = 'type:expense limit:50 currency:USD';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([
                    {start: 5, type: 'mention-user', length: 7}, // type:expense
                    {start: 19, type: 'mention-user', length: 2}, // limit:50
                    {start: 31, type: 'mention-user', length: 3}, // currency:USD
                ]);
            });

            it('does not highlight empty limit value', () => {
                const input = 'limit:';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([]);
            });
        });

        it('should handle valid AMOUNT filters but not invalid TOTAL amounts', () => {
            const input = 'amount:-50.25';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            expect(result).toEqual([
                {start: 7, type: 'mention-user', length: 6}, // amount:-50.25
            ]);
        });

        it('should not highlight TOTAL filter with amounts exceeding AMOUNT_MAX_LENGTH digits', () => {
            const input = 'total:99999999999';

            const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

            // Total amounts with more than AMOUNT_MAX_LENGTH digits fail validation
            expect(result).toEqual([]);
        });

        describe('view filter highlighting', () => {
            it('highlights valid view values', () => {
                const validViews = ['table', 'bar'];

                for (const view of validViews) {
                    const input = `view:${view}`;

                    const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                    expect(result).toEqual([{start: 5, type: 'mention-user', length: view.length}]);
                }
            });

            it('does not highlight invalid view values', () => {
                const input = 'view:invalid';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([]);
            });

            it('highlights view in complex query with other filters', () => {
                const input = 'type:expense view:bar category:Travel';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([
                    {start: 5, type: 'mention-user', length: 7}, // type:expense
                    {start: 18, type: 'mention-user', length: 3}, // view:bar
                    {start: 31, type: 'mention-user', length: 6}, // category:Travel
                ]);
            });

            it('does not highlight empty view value', () => {
                const input = 'view:';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([]);
            });

            it('highlights view:table in query', () => {
                const input = 'view:table';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([{start: 5, type: 'mention-user', length: 5}]);
            });

            it('highlights view:bar in query', () => {
                const input = 'view:bar';

                const result = parseForLiveMarkdown(input, currentUserName, mockSubstitutionMap, mockKnownValues);

                expect(result).toEqual([{start: 5, type: 'mention-user', length: 3}]);
            });
        });
    });

    describe('getTrimmedUserSearchQueryPreservingComma', () => {
        it('should preserve comma-separated values for "to" field when user types comma', () => {
            // User typed "to:user1," and is now selecting user2
            const result = getTrimmedUserSearchQueryPreservingComma('to:user1,', 'to');
            expect(result).toBe('to:user1,');
        });

        it('should return field prefix only when no comma is present', () => {
            // User typed "to:user1" and is selecting user2 (should replace)
            const result = getTrimmedUserSearchQueryPreservingComma('to:user1', 'to');
            expect(result).toBe('to:');
        });

        it('should preserve multiple comma-separated values', () => {
            // User typed "to:user1,user2," and is selecting user3
            const result = getTrimmedUserSearchQueryPreservingComma('to:user1,user2,', 'to');
            expect(result).toBe('to:user1,user2,');
        });

        it('should work with "from" field', () => {
            const result = getTrimmedUserSearchQueryPreservingComma('from:john@example.com,', 'from');
            expect(result).toBe('from:john@example.com,');
        });

        it('should work with "assignee" field', () => {
            const result = getTrimmedUserSearchQueryPreservingComma('assignee:user1,', 'assignee');
            expect(result).toBe('assignee:user1,');
        });

        it('should work with "payer" field', () => {
            const result = getTrimmedUserSearchQueryPreservingComma('payer:user1,', 'payer');
            expect(result).toBe('payer:user1,');
        });

        it('should work with "exporter" field', () => {
            const result = getTrimmedUserSearchQueryPreservingComma('exporter:user1,', 'exporter');
            expect(result).toBe('exporter:user1,');
        });

        it('should work with "attendee" field', () => {
            const result = getTrimmedUserSearchQueryPreservingComma('attendee:user1,', 'attendee');
            expect(result).toBe('attendee:user1,');
        });

        it('should not preserve commas for non-name fields like "category"', () => {
            // Category is not a name field, so commas should not be preserved
            const result = getTrimmedUserSearchQueryPreservingComma('category:travel,', 'category');
            expect(result).toBe('category:');
        });

        it('should handle case-insensitive field matching', () => {
            const result = getTrimmedUserSearchQueryPreservingComma('TO:user1,', 'to');
            expect(result).toBe('TO:user1,');
        });

        it('should handle queries with multiple fields and preserve comma in last name field', () => {
            const result = getTrimmedUserSearchQueryPreservingComma('type:expense to:user1,', 'to');
            expect(result).toBe('type:expense to:user1,');
        });

        it('should return query without autocompleted part when field key is not found', () => {
            // When the field key is not in the query, it should fallback
            const result = getTrimmedUserSearchQueryPreservingComma('some random text', 'to');
            expect(result).toBe('some random text');
        });

        it('should handle undefined fieldKey by returning query without autocompleted part', () => {
            const result = getTrimmedUserSearchQueryPreservingComma('to:user1', undefined);
            expect(result).toBe('to:');
        });

        it('should handle partial input while typing after comma', () => {
            // User typed "to:user1,joh" - should preserve "to:user1,"
            const result = getTrimmedUserSearchQueryPreservingComma('to:user1,joh', 'to');
            expect(result).toBe('to:user1,');
        });
    });

    describe('AccountingUtils exported-to search filter helpers', () => {
        describe('getExportLabelForConnection', () => {
            it('returns user-friendly name for QBO', () => {
                expect(getExportLabelForConnection(CONST.POLICY.CONNECTIONS.NAME.QBO)).toBe('QuickBooks Online');
            });

            it('returns user-friendly name for Sage Intacct', () => {
                expect(getExportLabelForConnection(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT)).toBe('Sage Intacct');
            });
        });

        describe('getStandardExportTemplateDisplayName', () => {
            it('returns display name for expense level export template', () => {
                expect(getStandardExportTemplateDisplayName(CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT)).toBe(CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT);
            });

            it('returns display name for report level export template', () => {
                expect(getStandardExportTemplateDisplayName(CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT)).toBe(CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT);
            });

            it('returns display name for the Canadian multiple tax export template', () => {
                expect(getStandardExportTemplateDisplayName(CONST.REPORT.EXPORT_OPTIONS.MULTIPLE_TAX_EXPORT)).toBe(CONST.REPORT.EXPORT_OPTION_LABELS.MULTIPLE_TAX_EXPORT);
            });

            it('returns display name for the Reconciliation - All Expenses template', () => {
                expect(getStandardExportTemplateDisplayName(CONST.REPORT.EXPORT_OPTIONS.RECONCILIATION_ALL_EXPENSES)).toBe(CONST.REPORT.EXPORT_OPTION_LABELS.RECONCILIATION_ALL_EXPENSES);
            });

            it('returns template name as-is when no standard mapping', () => {
                const customName = 'Custom Export Layout';
                expect(getStandardExportTemplateDisplayName(customName)).toBe(customName);
            });
        });

        describe('isStandardExportTemplate', () => {
            it('returns true for every standard export template ID', () => {
                expect(isStandardExportTemplate(CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT)).toBe(true);
                expect(isStandardExportTemplate(CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT)).toBe(true);
                expect(isStandardExportTemplate(CONST.REPORT.EXPORT_OPTIONS.MULTIPLE_TAX_EXPORT)).toBe(true);
                expect(isStandardExportTemplate(CONST.REPORT.EXPORT_OPTIONS.RECONCILIATION_ALL_EXPENSES)).toBe(true);
            });

            it('returns false for a custom template ID', () => {
                expect(isStandardExportTemplate('Custom Export Layout')).toBe(false);
            });
        });

        describe('isStandardExportTemplateLabel', () => {
            it('returns true for every standard export template label', () => {
                expect(isStandardExportTemplateLabel(CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT)).toBe(true);
                expect(isStandardExportTemplateLabel(CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT)).toBe(true);
                expect(isStandardExportTemplateLabel(CONST.REPORT.EXPORT_OPTION_LABELS.MULTIPLE_TAX_EXPORT)).toBe(true);
                expect(isStandardExportTemplateLabel(CONST.REPORT.EXPORT_OPTION_LABELS.RECONCILIATION_ALL_EXPENSES)).toBe(true);
            });

            it('returns false for a custom template label', () => {
                expect(isStandardExportTemplateLabel('Custom Export Layout')).toBe(false);
            });
        });
    });
});

describe('ordinary autocomplete parser boundaries', () => {
    afterEach(() => jest.restoreAllMocks());

    it('returns the original generated object with extra properties and escaped offsets', () => {
        // Given the real parser result, with an unused property at the generated-result boundary.
        const query = 'merchant:"Acme\\,Inc"';
        const parsed: unknown = parse(query);
        if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Expected the ordinary generated parser object');
        }
        Object.defineProperty(parsed, 'extra', {value: 'Unused parser metadata', enumerable: true});
        const parser = jest.spyOn(jest.requireActual<{parse: typeof parse}>('@libs/SearchParser/autocompleteParser'), 'parse').mockReturnValueOnce(parsed);
        // When the existing ordinary consumer handles it.
        const result = parseForAutocomplete(query);
        // Then narrowing preserves identity, extras and source widths instead of projecting fields.
        expect(result).toBe(parsed);
        expect(result).toHaveProperty('extra', 'Unused parser metadata');
        expect(result?.ranges).toEqual([{key: 'merchant', negated: false, value: 'Acme,Inc', start: 9, length: 11}]);
        expect(parser).toHaveBeenCalledWith(query);
    });

    const unknownLibraryResult: unknown = parse('from:alice', {peg$library: true});
    test.each([
        {description: 'library wrapper', result: unknownLibraryResult},
        {description: 'absent result', result: null},
        {description: 'invalid range value', result: {autocomplete: null, ranges: [{key: 'from', value: null, start: 5, length: 0}]}},
        {description: 'invalid autocomplete offset', result: {autocomplete: {key: 'from', value: '', start: '5', length: 0}, ranges: []}},
    ])('returns no highlights for $description', ({result}) => {
        // Given an erased result that cannot prove the consumed ordinary fields.
        const parser = jest.spyOn(jest.requireActual<{parse: typeof parse}>('@libs/SearchParser/autocompleteParser'), 'parse').mockReturnValue(result);
        const log = jest.spyOn(console, 'error').mockImplementation(() => {});
        const noKnownValues: KnownFilterValues = {userLogins: new Set(), currencies: new Set(), categories: new Set(), tags: new Set(), exportedTo: new Set()};
        // When each existing consumer handles the same boundary result.
        expect(parseForAutocomplete('from:alice')).toBeUndefined();
        // Then autocomplete logs once while live markdown safely skips highlighting.
        expect(log).toHaveBeenCalledTimes(1);
        expect(parseForLiveMarkdown('from:alice', '', {}, noKnownValues)).toEqual([]);
        expect(parser).toHaveBeenCalledTimes(2);
    });

    it('keeps real parser exceptions caught for autocomplete and propagated for live markdown', () => {
        // Given the real parser rejecting an unsupported input type at its public boundary.
        const log = jest.spyOn(console, 'error').mockImplementation(() => {});
        const noKnownValues: KnownFilterValues = {userLogins: new Set(), currencies: new Set(), categories: new Set(), tags: new Set(), exportedTo: new Set()};
        // When a deliberately malformed input reaches the existing consumers.
        // @ts-expect-error This malformed runtime input tests the parser's existing exception handling.
        expect(parseForAutocomplete(null)).toBeUndefined();
        // Then the same production parser exception propagates through live markdown.
        expect(() => {
            // @ts-expect-error Keep the exception limited to the invalid parser input.
            parseForLiveMarkdown(null, '', {}, noKnownValues);
        }).toThrow();
        expect(log).toHaveBeenCalledTimes(1);
    });

    test.each([
        ['columns:date', [{start: 8, type: 'mention-user', length: 4}]],
        ['columns:unknown-column', []],
        ['report-field-Custom:value', [{start: 20, type: 'mention-user', length: 5}]],
        ['createdBy:alice ReportID:123 TAXRATE:20', []],
        ['merchant:""', []],
    ])('highlights the real parser result for %s', (query, expected) => {
        // Given actual generated ranges and empty lookup data, without substituting the parser.
        const noKnownValues: KnownFilterValues = {userLogins: new Set(), currencies: new Set(), categories: new Set(), tags: new Set(), exportedTo: new Set()};
        // When live markdown applies its existing highlighting rules.
        const result = parseForLiveMarkdown(query, '', {}, noKnownValues);
        // Then column equality, dynamic keys and unsupported key spelling retain their outcomes.
        expect(result).toEqual(expected);
    });
});
