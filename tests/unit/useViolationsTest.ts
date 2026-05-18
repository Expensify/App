import {renderHook} from '@testing-library/react-native';
import useViolations from '@hooks/useViolations';
import CONST from '@src/CONST';
import type {TransactionViolation} from '@src/types/onyx';

describe('useViolations', () => {
    describe('violationsByField grouping', () => {
        it('should return empty array when violations array is empty', () => {
            // Given an empty violations array, which represents a transaction with no policy violations
            const violations: TransactionViolation[] = [];

            // When we call the hook to group violations by field
            const {result} = renderHook(() => useViolations(violations, false));

            // Then all field queries should return empty arrays because there are no violations to display
            expect(result.current.getViolationsForField('category')).toEqual([]);
            expect(result.current.getViolationsForField('tag')).toEqual([]);
            expect(result.current.getViolationsForField('receipt')).toEqual([]);
        });

        it('should group violations by their corresponding field', () => {
            // Given a transaction with violations across different fields (category, tag, receipt)
            // which simulates a real expense that has multiple policy compliance issues
            const violations: TransactionViolation[] = [
                {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                {name: CONST.VIOLATIONS.MISSING_TAG, type: CONST.VIOLATION_TYPES.VIOLATION},
                {name: CONST.VIOLATIONS.RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.VIOLATION},
            ];

            // When we call the hook to organize violations for the expense form UI
            const {result} = renderHook(() => useViolations(violations, false));

            // Then each violation should be accessible under its corresponding field
            // so the UI can display the right error message next to each input field
            expect(result.current.getViolationsForField('category')).toHaveLength(1);
            expect(result.current.getViolationsForField('category').at(0)?.name).toBe(CONST.VIOLATIONS.MISSING_CATEGORY);
            expect(result.current.getViolationsForField('tag')).toHaveLength(1);
            expect(result.current.getViolationsForField('tag').at(0)?.name).toBe(CONST.VIOLATIONS.MISSING_TAG);
            expect(result.current.getViolationsForField('receipt')).toHaveLength(1);
            expect(result.current.getViolationsForField('receipt').at(0)?.name).toBe(CONST.VIOLATIONS.RECEIPT_REQUIRED);
        });

        it('should group multiple violations under the same field', () => {
            // Given a transaction with multiple amount-related violations, which can happen when
            // an expense exceeds several limits simultaneously (e.g., over policy limit AND over category limit)
            const violations: TransactionViolation[] = [
                {name: CONST.VIOLATIONS.OVER_LIMIT, type: CONST.VIOLATION_TYPES.VIOLATION},
                {name: CONST.VIOLATIONS.OVER_CATEGORY_LIMIT, type: CONST.VIOLATION_TYPES.VIOLATION},
                {name: CONST.VIOLATIONS.MODIFIED_AMOUNT, type: CONST.VIOLATION_TYPES.VIOLATION},
            ];

            // When we query for amount field violations
            const {result} = renderHook(() => useViolations(violations, false));

            // Then all three violations should be grouped under the amount field
            // so the UI can show all relevant errors for that input
            expect(result.current.getViolationsForField('amount')).toHaveLength(3);
        });
    });

    describe('shouldShowOnlyViolations filtering', () => {
        it('should show all violation types when shouldShowOnlyViolations is false', () => {
            // Given violations of different types (violation, notice, warning) on a transaction
            // where we want to display all feedback to the user including informational notices
            const violations: TransactionViolation[] = [
                {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                {name: CONST.VIOLATIONS.MISSING_TAG, type: CONST.VIOLATION_TYPES.NOTICE},
                {name: CONST.VIOLATIONS.RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.WARNING},
            ];

            // When shouldShowOnlyViolations is false (showing all types of feedback)
            const {result} = renderHook(() => useViolations(violations, false));

            // Then all violation types should be included because the user needs to see
            // notices and warnings in addition to blocking violations
            expect(result.current.getViolationsForField('category')).toHaveLength(1);
            expect(result.current.getViolationsForField('tag')).toHaveLength(1);
            expect(result.current.getViolationsForField('receipt')).toHaveLength(1);
        });

        it('should only show violations of type "violation" when shouldShowOnlyViolations is true', () => {
            // Given violations of different types where we only want to show blocking violations
            // (e.g., in a submission flow where only hard blockers matter)
            const violations: TransactionViolation[] = [
                {name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION},
                {name: CONST.VIOLATIONS.MISSING_TAG, type: CONST.VIOLATION_TYPES.NOTICE},
                {name: CONST.VIOLATIONS.RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.WARNING},
            ];

            // When shouldShowOnlyViolations is true (filtering to only hard violations)
            const {result} = renderHook(() => useViolations(violations, true));

            // Then only the violation-type items should be returned because notices and warnings
            // don't block submission and shouldn't be displayed as errors
            expect(result.current.getViolationsForField('category')).toHaveLength(1);
            expect(result.current.getViolationsForField('tag')).toHaveLength(0);
            expect(result.current.getViolationsForField('receipt')).toHaveLength(0);
        });
    });

    describe('customRules violation field mapping', () => {
        it('should map customRules to receipt when no field is specified in data', () => {
            // Given a custom rules violation without a specific field target
            // which happens when the backend doesn't specify which field the rule applies to
            const violations: TransactionViolation[] = [{name: CONST.VIOLATIONS.CUSTOM_RULES, type: CONST.VIOLATION_TYPES.VIOLATION}];

            // When we query for violations
            const {result} = renderHook(() => useViolations(violations, false));

            // Then it should default to receipt field as a sensible fallback location
            expect(result.current.getViolationsForField('receipt')).toHaveLength(1);
        });

        it('should map customRules to the field specified in data', () => {
            // Given a custom rules violation with a specific field target (category)
            // which allows custom policy rules to show errors on the relevant input
            const violations: TransactionViolation[] = [{name: CONST.VIOLATIONS.CUSTOM_RULES, type: CONST.VIOLATION_TYPES.VIOLATION, data: {field: 'category'}}];

            // When we query for category field violations
            const {result} = renderHook(() => useViolations(violations, false));

            // Then the custom rule should appear under category, not the default receipt field
            expect(result.current.getViolationsForField('category')).toHaveLength(1);
            expect(result.current.getViolationsForField('receipt')).toHaveLength(0);
        });

        it('should map customRules to receipt when field in data is invalid', () => {
            // Given a custom rules violation with an invalid/unknown field name
            // which could happen due to backend misconfiguration
            const violations: TransactionViolation[] = [{name: CONST.VIOLATIONS.CUSTOM_RULES, type: CONST.VIOLATION_TYPES.VIOLATION, data: {field: 'invalidField'}}];

            // When we query for violations
            const {result} = renderHook(() => useViolations(violations, false));

            // Then it should fall back to receipt field to ensure the error is still displayed somewhere
            expect(result.current.getViolationsForField('receipt')).toHaveLength(1);
        });
    });

    describe('getViolationsForField - someTagLevelsRequired special logic', () => {
        it('should filter someTagLevelsRequired violations by errorIndexes when tagListIndex is provided', () => {
            // Given a someTagLevelsRequired violation that specifies which tag levels are missing via errorIndexes
            // This happens with multi-level tagging where only some levels are required
            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {errorIndexes: [0, 2]},
                },
            ];

            // When we query for specific tag levels by their index
            const {result} = renderHook(() => useViolations(violations, false));

            // Then only tag levels in errorIndexes should return the violation with the tagName populated
            // so each tag input only shows an error if that specific level is required
            const violationsForTag0 = result.current.getViolationsForField('tag', {tagListIndex: 0, tagListName: 'Tag Level 1'});
            expect(violationsForTag0).toHaveLength(1);
            expect(violationsForTag0.at(0)?.data?.tagName).toBe('Tag Level 1');

            const violationsForTag2 = result.current.getViolationsForField('tag', {tagListIndex: 2, tagListName: 'Tag Level 3'});
            expect(violationsForTag2).toHaveLength(1);
            expect(violationsForTag2.at(0)?.data?.tagName).toBe('Tag Level 3');

            // Tag level 1 is not in errorIndexes, so should return empty
            const violationsForTag1 = result.current.getViolationsForField('tag', {tagListIndex: 1, tagListName: 'Tag Level 2'});
            expect(violationsForTag1).toHaveLength(0);
        });

        it('should handle someTagLevelsRequired with tagListIndex of 0', () => {
            // Given a someTagLevelsRequired violation where only the first tag level (index 0) is required
            // This tests that index 0 is handled correctly (not treated as falsy)
            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {errorIndexes: [0]},
                },
            ];

            // When we query for tag level 0
            const {result} = renderHook(() => useViolations(violations, false));
            const violationsForTag = result.current.getViolationsForField('tag', {tagListIndex: 0, tagListName: 'First Tag'});

            // Then the violation should be returned because 0 is a valid index that should not be skipped
            expect(violationsForTag).toHaveLength(1);
            expect(violationsForTag.at(0)?.data?.tagName).toBe('First Tag');
        });
    });

    describe('getViolationsForField - missingTag with dependent tags', () => {
        it('should add tagName to missingTag violation when policyHasDependentTags is true', () => {
            // Given a missingTag violation on a policy with dependent tags
            // Dependent tags means selecting one tag affects available options in another
            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.MISSING_TAG,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            // When we query with policyHasDependentTags=true and a tagListName
            const {result} = renderHook(() => useViolations(violations, false));
            const violationsForTag = result.current.getViolationsForField('tag', {tagListName: 'Department'}, true);

            // Then the violation should include the tagName so the UI can show which specific tag is missing
            expect(violationsForTag).toHaveLength(1);
            expect(violationsForTag.at(0)?.data?.tagName).toBe('Department');
        });

        it('should not add tagName to missingTag violation when policyHasDependentTags is false', () => {
            // Given a missingTag violation on a policy without dependent tags
            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.MISSING_TAG,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            // When we query with policyHasDependentTags=false
            const {result} = renderHook(() => useViolations(violations, false));
            const violationsForTag = result.current.getViolationsForField('tag', {tagListName: 'Department'}, false);

            // Then the violation should not have tagName added because it's not needed for independent tags
            expect(violationsForTag).toHaveLength(1);
            expect(violationsForTag.at(0)?.data?.tagName).toBeUndefined();
        });
    });

    describe('getViolationsForField - tagOutOfPolicy special logic', () => {
        it('should filter tagOutOfPolicy violations by tagName when tagListName matches', () => {
            // Given multiple tagOutOfPolicy violations for different tag levels in a multi-level tag system
            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {tagName: 'Department'},
                },
                {
                    name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {tagName: 'Project'},
                },
            ];

            // When we query for each tag level by name
            const {result} = renderHook(() => useViolations(violations, false));

            // Then only the matching violation should be returned for each tag level
            // so each tag selector only shows its own "out of policy" error
            const violationsForDepartment = result.current.getViolationsForField('tag', {tagListName: 'Department'});
            expect(violationsForDepartment).toHaveLength(1);
            expect(violationsForDepartment.at(0)?.data?.tagName).toBe('Department');

            const violationsForProject = result.current.getViolationsForField('tag', {tagListName: 'Project'});
            expect(violationsForProject).toHaveLength(1);
            expect(violationsForProject.at(0)?.data?.tagName).toBe('Project');
        });

        it('should return all tagOutOfPolicy violations when tagListName is undefined', () => {
            // Given multiple tagOutOfPolicy violations without specifying a particular tag level to filter
            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {tagName: 'Department'},
                },
                {
                    name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {tagName: 'Project'},
                },
            ];

            // When we query without tagListName filter
            const {result} = renderHook(() => useViolations(violations, false));
            const violationsForTag = result.current.getViolationsForField('tag');

            // Then all tagOutOfPolicy violations should be returned for display in a summary view
            expect(violationsForTag).toHaveLength(2);
        });
    });

    describe('getViolationsForField - allTagLevelsRequired special logic', () => {
        it('should filter allTagLevelsRequired violations by tagName when tagValue is provided', () => {
            // Given allTagLevelsRequired violations that identify which tag levels are incomplete
            // This violation appears when one tag is set but others are required
            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {tagName: 'Department'},
                },
                {
                    name: CONST.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {tagName: 'Project'},
                },
            ];

            // When we query for a specific tag level that has a value set (tagValue provided)
            const {result} = renderHook(() => useViolations(violations, false));
            const violationsForDepartment = result.current.getViolationsForField('tag', {tagListName: 'Department'}, false, 'someTagValue');

            // Then only violations for that specific tag level should be returned
            // because we only want to show the error on the tag field that needs attention
            expect(violationsForDepartment).toHaveLength(1);
            expect(violationsForDepartment.at(0)?.data?.tagName).toBe('Department');
        });

        it('should return all allTagLevelsRequired violations when tagValue is not provided', () => {
            // Given allTagLevelsRequired violations without a specific tag value to filter by
            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {tagName: 'Department'},
                },
                {
                    name: CONST.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {tagName: 'Project'},
                },
            ];

            // When we query without tagValue (showing all violations)
            const {result} = renderHook(() => useViolations(violations, false));
            const violationsForTag = result.current.getViolationsForField('tag', {tagListName: 'Department'}, false);

            // Then all violations should be returned because without tagValue we show everything
            expect(violationsForTag).toHaveLength(2);
        });
    });

    describe('edge cases', () => {
        it('should preserve violation data when grouping', () => {
            // Given a violation with additional data (limit and currency info)
            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.OVER_CATEGORY_LIMIT,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {formattedLimit: '$1,000 USD', category: 'Travel'},
                },
            ];

            // When we retrieve the violation
            const {result} = renderHook(() => useViolations(violations, false));
            const amountViolations = result.current.getViolationsForField('amount');

            // Then all original data should be preserved for the UI to display detailed error messages
            expect(amountViolations).toHaveLength(1);
            expect(amountViolations.at(0)?.data).toEqual({formattedLimit: '$1,000 USD', category: 'Travel'});
        });
    });
});
