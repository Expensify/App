import {getEffectiveWorkArrangement, getWorkArrangementLabel} from '@libs/WorkArrangementUtils';

import {translateLocal} from '../utils/TestHelper';

describe('WorkArrangementUtils', () => {
    describe('getEffectiveWorkArrangement', () => {
        it.each([
            {memberArrangement: true, workspaceArrangement: false, fallbackArrangement: false, expected: true},
            {memberArrangement: false, workspaceArrangement: true, fallbackArrangement: false, expected: false},
            {memberArrangement: undefined, workspaceArrangement: true, fallbackArrangement: false, expected: true},
            {memberArrangement: undefined, workspaceArrangement: undefined, fallbackArrangement: false, expected: false},
            {memberArrangement: undefined, workspaceArrangement: undefined, fallbackArrangement: true, expected: true},
        ] as const)('uses member arrangement when set and otherwise falls back to the workspace default (%#)', ({memberArrangement, workspaceArrangement, fallbackArrangement, expected}) => {
            // Given a member arrangement and an optional workspace default,
            // When resolving the member's effective work arrangement with an optional fallback,
            // Then the member and workspace values take precedence and the fallback is used only when both are missing.
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
