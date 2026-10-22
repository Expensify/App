import {getEffectiveWorkArrangement, getWorkArrangementLabel} from '@libs/WorkArrangementUtils';

import {translateLocal} from '../utils/TestHelper';

describe('WorkArrangementUtils', () => {
    describe('getEffectiveWorkArrangement', () => {
        it.each([
            {memberArrangement: true, workspaceArrangement: false, fallbackArrangement: false, expected: true},
            {memberArrangement: false, workspaceArrangement: true, fallbackArrangement: false, expected: false},
            {memberArrangement: undefined, workspaceArrangement: true, fallbackArrangement: false, expected: true},
            {memberArrangement: undefined, workspaceArrangement: false, expected: false},
            {memberArrangement: undefined, workspaceArrangement: undefined, expected: true},
            {memberArrangement: undefined, workspaceArrangement: undefined, fallbackArrangement: false, expected: false},
        ] as const)('uses member arrangement when set, then workspace default, then fallback (%#)', ({memberArrangement, workspaceArrangement, fallbackArrangement, expected}) => {
            // Given a member arrangement and an optional workspace default,
            // When resolving the member's effective work arrangement,
            // Then explicit member and workspace values take precedence, with an office-based server default unless an explicit fallback is provided.
            expect(getEffectiveWorkArrangement(memberArrangement, workspaceArrangement, fallbackArrangement)).toBe(expected);
        });
    });

    describe('getWorkArrangementLabel', () => {
        it.each([
            {isOfficeBased: true, expectedTranslationKey: 'workspace.people.officeBased'},
            {isOfficeBased: false, expectedTranslationKey: 'workspace.people.noRegularWorkspace'},
        ] as const)('translates the work arrangement for the current locale (%#)', ({isOfficeBased, expectedTranslationKey}) => {
            // Given an office-based flag,
            // When requesting its label in the current locale,
            // Then the corresponding workspace people translation is used.
            expect(getWorkArrangementLabel(translateLocal, isOfficeBased)).toBe(translateLocal(expectedTranslationKey));
        });
    });
});
