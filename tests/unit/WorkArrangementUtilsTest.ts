import {getEffectiveWorkArrangement, getWorkArrangementLabel} from '@libs/WorkArrangementUtils';

import {translateLocal} from '../utils/TestHelper';

describe('WorkArrangementUtils', () => {
    describe('getEffectiveWorkArrangement', () => {
        it.each([
            {memberArrangement: true, workspaceArrangement: false, expected: true},
            {memberArrangement: false, workspaceArrangement: true, expected: false},
            {memberArrangement: undefined, workspaceArrangement: true, expected: true},
            {memberArrangement: undefined, workspaceArrangement: false, expected: false},
            {memberArrangement: undefined, workspaceArrangement: undefined, expected: true},
        ] as const)('uses member arrangement when set and otherwise falls back to the workspace default (%#)', ({memberArrangement, workspaceArrangement, expected}) => {
            // Given a member arrangement and an optional workspace default,
            // When resolving the member's effective work arrangement,
            // Then the member value takes precedence, and a workspace that stored neither reads as office-based
            // the way the server reads it.
            expect(getEffectiveWorkArrangement(memberArrangement, workspaceArrangement)).toBe(expected);
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
